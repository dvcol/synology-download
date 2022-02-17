import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import { NotificationService } from '@src/services';
import {
  getActiveTasksIdsByActionScope,
  geTasksIdsByStatusType,
  getFinishedTasksIdsByActionScope,
  getLogged,
  getNotificationsBannerFailedEnabled,
  getNotificationsBannerFinishedEnabled,
  getPassword,
  getPausedTasksIdsByActionScope,
  getSid,
  getTasksIdsByActionScope,
  getUrl,
  getUsername,
} from '@src/store/selectors';
import { addLoading, removeLoading, setLogged, setSid, setTasks, spliceTasks } from '@src/store/actions';
import { store$ } from '@src/store';
import {
  CommonResponse,
  DownloadStationConfig,
  DownloadStationInfo,
  DownloadStationStatistic,
  FileList,
  FileListOption,
  FolderList,
  InfoResponse,
  LoginError,
  LoginResponse,
  NotReadyError,
  StoreOrProxy,
  Task,
  TaskList,
  TaskListOption,
  TaskStatus,
  TaskStatusType,
} from '@src/models';
import { before, useI18n as UseI18n } from '@src/utils';
import { EMPTY, finalize, Observable, tap } from 'rxjs';

const i18n = UseI18n('common', 'error');

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

    store$(store, getUrl).subscribe((url) => this.setBaseUrl(url));
    store$(store, getSid).subscribe((sid) => this.setSid(sid));
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
      finalize(() => this.store.dispatch(removeLoading()))
    );

  static info(): Observable<InfoResponse> {
    return this.infoClient.info().pipe(this.loadingOperator);
  }

  static loginTest(
    username = getUsername(this.store.getState()),
    password = getPassword(this.store.getState()),
    baseUrl?: string
  ): Observable<LoginResponse> {
    if (!username || !password) throw new Error(i18n({ key: 'login_password_required', substitutions: [username ?? '', password ?? ''] }));
    return this.authClient.login(username, password, baseUrl).pipe(this.readyCheckOperator(false));
  }

  static login(username?: string, password?: string, baseUrl?: string): Observable<LoginResponse> {
    return this.loginTest(username, password, baseUrl).pipe(
      tap({
        next: ({ sid }) => {
          this.store.dispatch(setSid(sid));
          this.store.dispatch(setLogged(true));
        },
        error: () => {
          this.store.dispatch(setSid(undefined));
          this.store.dispatch(setLogged(false));
        },
      })
    );
  }

  static logout(): Observable<void> {
    return this.authClient.logout().pipe(
      this.readyCheckOperator(),
      tap(() => {
        this.store.dispatch(setSid(undefined));
        this.store.dispatch(setLogged(false));
      })
    );
  }

  static listFolders(readonly = true): Observable<FolderList> {
    return this.fileClient.listFolder(0, 0, readonly).pipe(this.readyCheckOperator());
  }

  static listFiles(folderPath: string, filetype: 'all' | 'dir' = 'dir'): Observable<FileList> {
    return this.fileClient.listFile(folderPath, 0, 0, filetype, [FileListOption.perm]).pipe(this.readyCheckOperator());
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
    return this.downloadClient.getStatistic().pipe(this.readyCheckOperator());
  }

  static listTasks(): Observable<TaskList> {
    // snapshot task before call
    const extract = geTasksIdsByStatusType(this.store.getState());
    return this.downloadClient.listTasks(0, -1, [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer]).pipe(
      this.loadingOperator,
      tap(({ tasks }) => {
        // notify if we have tasks
        this.notifyTasks(extract, tasks);
        this.store.dispatch(setTasks(tasks));
      })
    );
  }

  private static notifyTasks({ finished, error }: Record<TaskStatusType, Set<Task['id']>>, tasks: Task[], state = this.store.getState()): void {
    tasks?.forEach((t) => {
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
      tap(() => this.listTasks().subscribe())
    );
  }

  static resumeAllTasks(ids: Set<Task['id']> = getPausedTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.resumeTask(Array.from(ids).join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.pauseTask(id).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe())
    );
  }

  static pauseAllTasks(ids: Set<Task['id']> = getActiveTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.pauseTask(Array.from(ids).join(',')) : EMPTY;
  }

  static createTask(uri: string, source?: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      this.loadingOperator,
      tap({
        complete: () => {
          this.listTasks().subscribe();
          NotificationService.taskCreated(uri, source, destination);
        },
        error: (error) => {
          NotificationService.error({
            title: i18n('create_task_fail'),
            message: error?.message ?? error?.name ?? error,
            contextMessage: source,
          });
        },
      })
    );
  }

  static editTask(id: string | string[], destination: string): Observable<CommonResponse[]> {
    return this.downloadClient.editTask(id, destination).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe())
    );
  }

  static deleteTask(id: string | string[], force = false): Observable<CommonResponse[]> {
    return this.downloadClient.deleteTask(id, force).pipe(
      this.loadingOperator,
      tap(() => {
        this.store.dispatch(spliceTasks(id));
        this.listTasks().subscribe();
      })
    );
  }

  static deleteAllTasks(ids: Set<Task['id']> = getTasksIdsByActionScope(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return ids?.size ? this.deleteTask(Array.from(ids).join(','), force) : EMPTY;
  }

  static deleteFinishedTasks(
    ids: Set<Task['id']> = getFinishedTasksIdsByActionScope(this.store.getState()),
    force = false
  ): Observable<CommonResponse[]> {
    return this.deleteAllTasks(ids, force);
  }
}
