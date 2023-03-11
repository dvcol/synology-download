import { catchError, EMPTY, finalize, map, of, Subject, switchMap, tap, throttleTime, throwError } from 'rxjs';

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
  QueryAutoLoginOptions,
  StoreOrProxy,
  Task,
  TaskComplete,
  TaskCompleteResponse,
  TaskEditRequest,
  TaskEditResponse,
  TaskFileEditRequest,
  TaskList,
} from '@src/models';
import {
  ChromeMessageType,
  ConnectionType,
  FetchError,
  FileListOption,
  LoginError,
  mapToTask,
  NotReadyError,
  ServiceInstance,
  TaskListOption,
  TaskStatus,
} from '@src/models';
import { LoggerService, NotificationService } from '@src/services';
import { SynologyAuthService, SynologyDownload2Service, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import {
  addDestinationHistory,
  addLoading,
  addStopping,
  removeLoading,
  removeStopping,
  resetStopping,
  setLogged,
  setSid,
  setTasks,
  setTaskStats,
  spliceTasks,
} from '@src/store/actions';
import {
  getActiveAndWaitingTasksIdsByActionScope,
  getCredentials,
  getFinishedAnErrorTasksIdsByActionScope,
  getFinishedTasksIdsByActionScope,
  getLogged,
  getNotificationsBannerFailedEnabled,
  getNotificationsBannerFinishedEnabled,
  getOption,
  getPausedTasksIdsByActionScope,
  getPopup,
  getShouldAutoLogin,
  getSid,
  getStoppingIds,
  getTasksIdsByActionScope,
  getTasksIdsByStatusType,
  getUrl,
} from '@src/store/selectors';
import { before, sendMessage, store$ } from '@src/utils';

import type { Observable } from 'rxjs';

// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = useI18n('common', 'error');

export class QueryService {
  private static source: ServiceInstance;
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;
  private static infoClient: SynologyInfoService;
  private static authClient: SynologyAuthService;
  private static fileClient: SynologyFileService;
  private static downloadClient: SynologyDownloadService;
  private static download2Client: SynologyDownload2Service;
  private static baseUrl: string;

  static init(store: StoreOrProxy, source: ServiceInstance, isProxy = false) {
    this.store = store;
    this.source = source;
    this.isProxy = isProxy;

    this.infoClient = new SynologyInfoService(isProxy);
    this.authClient = new SynologyAuthService(isProxy);
    this.fileClient = new SynologyFileService(isProxy);
    this.downloadClient = new SynologyDownloadService(isProxy);
    this.download2Client = new SynologyDownload2Service(isProxy);

    store$<string>(store, getUrl).subscribe(url => this.setBaseUrl(url));
    store$<string | undefined>(store, getSid).subscribe(sid => this.setSid(sid));

    // TODO - remove this if HTTPS is fixed
    this.autologinQueue
      .pipe(
        throttleTime(1000),
        tap(options => this.autoLogin(options).subscribe()),
      )
      .subscribe();

    LoggerService.debug('Query service initialized', { isProxy });
  }

  static setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
    this.infoClient.setBaseUrl(baseUrl);
    this.authClient.setBaseUrl(baseUrl);
    this.fileClient.setBaseUrl(baseUrl);
    this.downloadClient.setBaseUrl(baseUrl);
    this.download2Client.setBaseUrl(baseUrl);
  }

  static setSid(sid?: string): void {
    this.infoClient.setSid(sid);
    this.authClient.setSid(sid);
    this.fileClient.setSid(sid);
    this.downloadClient.setSid(sid);
    this.download2Client.setSid(sid);
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

  private static loadingOperator =
    (logged?: boolean, ready?: boolean) =>
    <T>(source: Observable<T>) =>
      source.pipe(
        this.readyCheckOperator(logged, ready),
        before(() => this.store.dispatch(addLoading())),
        finalize(() => this.store.dispatch(removeLoading())),
      );

  /**
   * This handles errors in a generic way
   * @private
   */
  private static handleErrors = <T>(source: Observable<T>) =>
    source.pipe(
      catchError(error => {
        throw this.catchAutoLogin(error);
      }),
    );

  /**
   * A autoLogin event queue to avoid spamming
   * @private
   * @todo TODO - investigate why this is required
   */
  private static autologinQueue = new Subject<QueryAutoLoginOptions>();

  /**
   * This is to attempts re-logging when we get SSL error in HTTPS, not sure why
   * @private
   * @todo TODO - investigate why this is required
   */
  private static catchAutoLogin(err: Error) {
    if (err.message !== 'Failed to fetch') return err;

    // mark as logged out
    this.store.dispatch(setLogged(false));

    if ([ServiceInstance.Popup, ServiceInstance.Option].includes(this.source)) {
      LoggerService.error('Fetch error caught, attempting auto-login locally in ', this.source);
      this.autologinQueue.next({ notify: false, logged: false });
      return new FetchError(err, i18n('fetch_failed_auto_login', 'common', 'error'));
    }

    // if  popup or option open
    if (getPopup(this.store.getState()) || getOption(this.store.getState())) {
      LoggerService.error('Fetch error caught, sending auto-login to popup/option');
      sendMessage({ type: ChromeMessageType.autoLogin }).subscribe({
        error: e => {
          LoggerService.error('Auto-login failed to send.', e);
          this.autologinQueue.next({ logged: false });
        },
      });
      return new FetchError(err, i18n('fetch_failed_auto_login', 'common', 'error'));
    }

    if (ServiceInstance.Content !== this.source) {
      LoggerService.error('Fetch error caught, attempting auto-login locally in ', this.source);
      this.autologinQueue.next({ notify: false, logged: false });
      return new FetchError(err, i18n('fetch_failed_auto_login', 'common', 'error'));
    }

    return new FetchError(err, i18n('fetch_failed', 'common', 'error'));
  }

  static info(baseUrl?: string, doNotProxy?: boolean): Observable<InfoResponse> {
    return this.infoClient.info(baseUrl, { doNotProxy }).pipe(this.readyCheckOperator(false, !baseUrl?.length), this.handleErrors);
  }

  private static doLogin(
    credentials = getCredentials(this.store.getState()),
    { baseUrl, doNotProxy }: { baseUrl?: string; doNotProxy?: boolean },
  ): Observable<LoginResponse> {
    const { username, password, authVersion } = credentials;
    if (!username || !password) {
      const error = new Error(i18n({ key: 'login_password_required', substitutions: [username ?? '', password ?? ''] }));
      return throwError(() => error);
    }
    let request: LoginRequest = { account: username, passwd: password, baseUrl };

    if (ConnectionType.twoFactor === credentials?.type) {
      try {
        request = this.twoFactorRequest(request, credentials);
      } catch (e) {
        return throwError(() => e);
      }
    }
    return this.authClient.login(request, authVersion?.toString(), doNotProxy).pipe(this.readyCheckOperator(false, !baseUrl?.length));
  }

  private static twoFactorRequest(request: LoginRequest, { otp_code, enable_device_token, device_name, device_id }: Credentials): LoginRequest {
    if ((!enable_device_token && !otp_code) || (!!enable_device_token && !device_name)) {
      throw new Error(i18n({ key: 'otp_code_device_required', substitutions: [otp_code ?? 'missing code', device_name ?? 'missing device name'] }));
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

  static loginTest(credentials?: Credentials, baseUrl?: string, doNotProxy = true): Observable<LoginResponse> {
    return this.doLogin({ ...credentials, enable_device_token: false }, { baseUrl, doNotProxy });
  }

  static login(credentials?: Credentials, baseUrl?: string, doNotProxy = true): Observable<LoginResponse> {
    return this.doLogin(credentials, { baseUrl, doNotProxy }).pipe(
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

  /**
   * If the application is not currently logged-in and we have the appropriate settings, we attempt a login.
   * If any condition is not respected, we return an empty observable that completes without emitting
   *
   * @param options optional inputs, state, settings and notify
   */
  static autoLogin(options: QueryAutoLoginOptions = {}): Observable<LoginResponse | null> {
    const { logged, notify, autoLogin } = {
      notify: true,
      logged: getLogged(this.store.getState()),
      autoLogin: getShouldAutoLogin(this.store.getState()),
      ...options,
    };
    LoggerService.debug('Attempting auto-login', { logged, autoLogin });

    // If we are already logged-in we ignore
    if (logged) return of(null);

    // If missing required settings
    if (!autoLogin) return of(null);

    // Attempt to Restore login
    return QueryService.login().pipe(
      this.loadingOperator(false, true),
      tap({
        next: () => LoggerService.debug('Auto-login attempt successful'),
        error: err => {
          LoggerService.warn('Auto-login failed.', err);

          if (notify) {
            NotificationService.error({
              title: i18n('manual_login_required'),
              message: i18n({ key: `auto_login`, substitutions: [err?.message ?? err?.name ?? ''] }),
              contextMessage: getUrl(this.store.getState()),
            });
          }
        },
      }),
    );
  }

  static listFolders(readonly = true): Observable<FolderList> {
    return this.fileClient.listFolder(0, 0, readonly).pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static listFiles(folderPath: string, filetype: 'all' | 'dir' = 'dir'): Observable<FileList> {
    return this.fileClient.listFile(folderPath, 0, 0, filetype, [FileListOption.perm]).pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static createFolder(
    folderPath: string,
    name: string,
    forceParent = false,
    additional: FileListOption[] = [FileListOption.perm],
  ): Observable<NewFolderList> {
    return this.fileClient.createFolder(folderPath, name, forceParent, additional).pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static renameFolder(
    folderPath: string,
    name: string,
    additional: FileListOption[] = [FileListOption.perm],
    searchTaskId?: string,
  ): Observable<FileList> {
    return this.fileClient.renameFolder(folderPath, name, additional, searchTaskId).pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static getConfig(): Observable<DownloadStationConfig> {
    return this.downloadClient.getConfig().pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static setConfig(config: DownloadStationConfig): Observable<CommonResponse> {
    return this.downloadClient.setConfig(config).pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static getInfo(): Observable<DownloadStationInfo> {
    return this.downloadClient.getInfo().pipe(this.readyCheckOperator(), this.handleErrors);
  }

  static getStatistic(): Observable<DownloadStationStatistic> {
    return this.downloadClient.getStatistic().pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(stats => {
        this.store.dispatch(setTaskStats(stats));
      }),
    );
  }

  static listTasks(): Observable<TaskList> {
    // snapshot task before call
    const extract: ContentStatusTypeId<Task['id']> = getTasksIdsByStatusType(this.store.getState());
    return this.downloadClient.listTasks(0, -1, [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer]).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(({ tasks }) => {
        const _stoppingIds = getStoppingIds(this.store.getState());
        const _tasks = tasks?.map(t => mapToTask(t, _stoppingIds));
        // notify if we have tasks
        this.notifyTasks(extract, _tasks);
        this.updateStopping(_tasks, _stoppingIds);
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

  private static updateStopping(tasks: Task[], stoppingIds: TaskComplete['taskId'][]) {
    const ids = tasks?.map(({ id }) => id);

    if (!ids?.length) return this.store.dispatch(resetStopping());

    const toRemove = stoppingIds?.filter(id => !ids.includes(id));

    if (!toRemove?.length) return;
    this.store.dispatch(removeStopping(toRemove));
  }

  static resumeTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.resumeTask(id).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(() => this.listTasks().subscribe()),
    );
  }

  static resumeAllTasks(ids: Set<Task['id']> = getPausedTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.resumeTask(Array.from(ids).join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.pauseTask(id).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(() => this.listTasks().subscribe()),
    );
  }

  static pauseAllTasks(ids: Set<Task['id']> = getActiveAndWaitingTasksIdsByActionScope(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.size ? this.pauseTask(Array.from(ids).join(',')) : EMPTY;
  }

  static createTask(uri: string, source?: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      this.loadingOperator(),
      this.handleErrors,
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

  static stopTask(id: string): Observable<TaskCompleteResponse> {
    return this.download2Client.stopTask(id).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(({ task_id }) => {
        this.store.dispatch(addStopping({ id: task_id, taskId: id }));
        this.listTasks().subscribe();
      }),
    );
  }

  static getTaskEdit(id: string): Observable<TaskEditResponse> {
    return this.download2Client.getTaskEdit(id).pipe(this.loadingOperator(), this.handleErrors);
  }

  static editTask(request: TaskEditRequest): Observable<CommonResponse[]> {
    return this.download2Client.editTask(request).pipe(
      this.loadingOperator(),
      this.handleErrors,
      switchMap(res => this.listTasks().pipe(map(() => res))),
    );
  }

  static editTaskFile(request: TaskFileEditRequest): Observable<CommonResponse[]> {
    return this.download2Client.editFile(request).pipe(
      this.loadingOperator(),
      this.handleErrors,
      switchMap(res => this.listTasks().pipe(map(() => res))),
    );
  }

  static deleteTask(id: string | string[], force = false): Observable<CommonResponse[]> {
    return this.downloadClient.deleteTask(id, force).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(() => {
        this.store.dispatch(spliceTasks(id));
        this.listTasks().subscribe();
      }),
    );
  }

  static deleteAllTasks(ids: Set<Task['id']> = getTasksIdsByActionScope(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return ids?.size ? this.deleteTask(Array.from(ids).join(','), force) : EMPTY;
  }

  static deleteFinishedAndErrorTasks(
    ids: Set<Task['id']> = getFinishedAnErrorTasksIdsByActionScope(this.store.getState()),
    force = false,
  ): Observable<CommonResponse[]> {
    return ids?.size ? this.deleteTask(Array.from(ids).join(','), force) : EMPTY;
  }

  static deleteFinishedTasks(
    ids: Set<Task['id']> = getFinishedTasksIdsByActionScope(this.store.getState()),
    force = false,
  ): Observable<CommonResponse[]> {
    return this.deleteAllTasks(ids, force);
  }
}
