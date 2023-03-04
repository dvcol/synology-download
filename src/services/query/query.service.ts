import { EMPTY, finalize, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type {
  CommonResponse,
  ContentStatusTypeId,
  Credentials,
  DownloadStationConfig,
  DownloadStationInfo,
  DownloadStationStatistic,
  FileList,
  FolderList,
  InfoResponse,
  LoginRequest,
  LoginResponse,
  NewFolderList,
  StoreOrProxy,
  Task,
  TaskList,
} from '@src/models';
import { ConnectionType, FileListOption, LoginError, mapToTask, NotReadyError, TaskListOption, TaskStatus } from '@src/models';
import { NotificationService } from '@src/services';
import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import { store$ } from '@src/store';
import {
  addDestinationHistory,
  addLoading,
  removeLoading,
  resetLoading,
  setLogged,
  setSid,
  setTasks,
  setTaskStats,
  spliceTasks,
} from '@src/store/actions';
import {
  getCredentials,
  getFinishedTasksIdsByActionScope,
  getLogged,
  getNotificationsBannerFailedEnabled,
  getNotificationsBannerFinishedEnabled,
  getPausedTasksIdsByActionScope,
  getSid,
  getTasksIdsByActionScope,
  getTasksIdsByStatusType,
  getUrl,
} from '@src/store/selectors';
import { before } from '@src/utils';

import type { Observable } from 'rxjs';

// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = useI18n('common', 'error');

export class QueryService {
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;
  private static infoClient: SynologyInfoService;
  private static authClient: SynologyAuthService;
  private static fileClient: SynologyFileService;
  private static downloadClient: SynologyDownloadService;
  private static baseUrl: string;

  static init(store: StoreOrProxy, isProxy = false) {
    this.store = store;
    this.isProxy = isProxy;

    this.infoClient = new SynologyInfoService(isProxy);
    this.authClient = new SynologyAuthService(isProxy);
    this.fileClient = new SynologyFileService(isProxy);
    this.downloadClient = new SynologyDownloadService(isProxy);

    store$<string>(store, getUrl).subscribe(url => this.setBaseUrl(url));
    store$<string>(store, getSid).subscribe(sid => this.setSid(sid));

    this.store.dispatch(resetLoading());
  }

  static setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.infoClient.setBaseUrl(baseUrl);
    this.authClient.setBaseUrl(baseUrl);
    this.fileClient.setBaseUrl(baseUrl);
    this.downloadClient.setBaseUrl(baseUrl);
  }

  static setSid(sid?: string): void {
    this.infoClient.setSid(sid);
    this.authClient.setSid(sid);
    this.fileClient.setSid(sid);
    this.downloadClient.setSid(sid);
  }

  static get isReady() {
    return !!this.baseUrl?.length;
  }

  static get isLoggedIn() {
    return getLogged(this.store.getState());
  }

  private static readyCheck(logged = true, ready = true) {
    if (ready && !this.isReady) throw new NotReadyError(i18n('query_service_not_ready'));
    if (logged && !this.isLoggedIn) throw new LoginError(i18n('query_service_not_logged_in'));
  }

  private static readyCheckOperator =
    (logged?: boolean, ready?: boolean) =>
    <T>(source: Observable<T>) =>
      source.pipe(before(() => this.readyCheck(logged, ready)));

  private static loadingOperator = <T>(source: Observable<T>) =>
    source.pipe(
      this.readyCheckOperator(),
      before(() => this.store.dispatch(addLoading())),
      finalize(() => this.store.dispatch(removeLoading())),
    );

  static info(baseUrl?: string): Observable<InfoResponse> {
    return this.infoClient.info(baseUrl).pipe(this.readyCheckOperator(false, !baseUrl?.length));
  }

  private static doLogin(credentials = getCredentials(this.store.getState()), baseUrl?: string): Observable<LoginResponse> {
    const { username, password, authVersion } = credentials;
    if (!username || !password) throw new Error(i18n({ key: 'login_password_required', substitutions: [username ?? '', password ?? ''] }));

    let request: LoginRequest = { account: username, passwd: password, baseUrl };

    if (ConnectionType.twoFactor === credentials?.type) {
      request = this.twoFactorRequest(request, credentials);
    }
    return this.authClient.login(request, String(authVersion ?? 1)).pipe(this.readyCheckOperator(false, !baseUrl?.length));
  }

  private static twoFactorRequest(request: LoginRequest, { otp_code, enable_device_token, device_name, device_id }: Credentials): LoginRequest {
    if (!otp_code || (!!enable_device_token && !device_name)) {
      throw new Error(i18n({ key: 'otp_code_device_required', substitutions: [otp_code ?? '', device_name ?? ''] }));
    }
    // If we enable remember device
    if (enable_device_token) {
      // If we already have token, we return omitted OTP request
      if (device_id) return { ...request, device_id, device_name };
      // If not we demand a device token with name and otp
      return { ...request, enable_device_token: 'yes', device_name, otp_code };
    }
    // else we just request with OTP
    return { ...request, otp_code };
  }

  static loginTest(credentials?: Credentials, baseUrl?: string): Observable<LoginResponse> {
    return this.doLogin({ ...credentials, enable_device_token: false }, baseUrl);
  }

  static login(credentials?: Credentials, baseUrl?: string): Observable<LoginResponse> {
    return this.doLogin(credentials, baseUrl).pipe(
      tap({
        next: res => {
          this.store.dispatch(setSid(res?.sid));
          this.store.dispatch(setLogged(true));
        },
        error: () => {
          this.store.dispatch(setSid(undefined));
          this.store.dispatch(setLogged(false));
        },
      }),
    );
  }

  static logout(): Observable<void> {
    return this.authClient.logout().pipe(
      this.readyCheckOperator(),
      tap(() => {
        this.store.dispatch(setSid(undefined));
        this.store.dispatch(setLogged(false));
      }),
    );
  }

  static listFolders(readonly = true): Observable<FolderList> {
    return this.fileClient.listFolder(0, 0, readonly).pipe(this.readyCheckOperator());
  }

  static listFiles(folderPath: string, filetype: 'all' | 'dir' = 'dir'): Observable<FileList> {
    return this.fileClient.listFile(folderPath, 0, 0, filetype, [FileListOption.perm]).pipe(this.readyCheckOperator());
  }

  static createFolder(
    folderPath: string,
    name: string,
    forceParent = false,
    additional: FileListOption[] = [FileListOption.perm],
  ): Observable<NewFolderList> {
    return this.fileClient.createFolder(folderPath, name, forceParent, additional).pipe(this.readyCheckOperator());
  }

  static renameFolder(
    folderPath: string,
    name: string,
    additional: FileListOption[] = [FileListOption.perm],
    searchTaskId?: string,
  ): Observable<FileList> {
    return this.fileClient.renameFolder(folderPath, name, additional, searchTaskId).pipe(this.readyCheckOperator());
  }

  static getConfig(): Observable<DownloadStationConfig> {
    return this.downloadClient.getConfig().pipe(this.readyCheckOperator());
  }

  static setConfig(config: DownloadStationConfig): Observable<CommonResponse> {
    return this.downloadClient.setConfig(config).pipe(this.readyCheckOperator());
  }

  static getInfo(): Observable<DownloadStationInfo> {
    return this.downloadClient.getInfo().pipe(this.readyCheckOperator());
  }

  static getStatistic(): Observable<DownloadStationStatistic> {
    return this.downloadClient.getStatistic().pipe(
      this.loadingOperator,
      tap(stats => {
        this.store.dispatch(setTaskStats(stats));
      }),
    );
  }

  static listTasks(): Observable<TaskList> {
    // snapshot task before call
    const extract: ContentStatusTypeId<Task['id']> = getTasksIdsByStatusType(this.store.getState());
    return this.downloadClient.listTasks(0, -1, [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer]).pipe(
      this.loadingOperator,
      tap(({ tasks }) => {
        const _tasks = tasks?.map(mapToTask);
        // notify if we have tasks
        this.notifyTasks(extract, _tasks);
        this.store.dispatch(setTasks(_tasks));
      }),
    );
  }

  private static notifyTasks({ finished, error }: ContentStatusTypeId<Task['id']>, tasks: Task[], state = this.store.getState()): void {
    tasks?.forEach(t => {
      if (getNotificationsBannerFinishedEnabled(state) && TaskStatus.finished === t.status && !finished.has(t.id)) {
        NotificationService.taskFinished(t);
      } else if (getNotificationsBannerFailedEnabled(state) && TaskStatus.error === t.status && !error.has(t.id)) {
        NotificationService.taskError(t);
      }
    });
  }

  static resumeTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.resumeTask(id).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe()),
    );
  }

  static resumeAllTasks(ids: Set<Task['id']> = getPausedTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.resumeTask(Array.from(ids).join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.pauseTask(id).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe()),
    );
  }

  static pauseAllTasks(ids: Set<Task['id']> = getTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.pauseTask(Array.from(ids).join(',')) : EMPTY;
  }

  static createTask(uri: string, source?: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      this.loadingOperator,
      tap({
        complete: () => {
          this.listTasks().subscribe();
          if (destination) this.store.dispatch(addDestinationHistory(destination));
          NotificationService.taskCreated(uri, source, destination);
        },
        error: error => {
          NotificationService.error({
            title: i18n('create_task_fail'),
            message: error?.message ?? error?.name ?? '',
            contextMessage: source,
          });
        },
      }),
    );
  }

  static editTask(id: string | string[], destination: string): Observable<CommonResponse[]> {
    return this.downloadClient.editTask(id, destination).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe()),
    );
  }

  static deleteTask(id: string | string[], force = false): Observable<CommonResponse[]> {
    return this.downloadClient.deleteTask(id, force).pipe(
      this.loadingOperator,
      tap(() => {
        this.store.dispatch(spliceTasks(id));
        this.listTasks().subscribe();
      }),
    );
  }

  static deleteAllTasks(ids: Set<Task['id']> = getTasksIdsByActionScope(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return ids?.size ? this.deleteTask(Array.from(ids).join(','), force) : EMPTY;
  }

  static deleteFinishedTasks(
    ids: Set<Task['id']> = getFinishedTasksIdsByActionScope(this.store.getState()),
    force = false,
  ): Observable<CommonResponse[]> {
    return this.deleteAllTasks(ids, force);
  }
}
