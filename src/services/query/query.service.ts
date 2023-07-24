import { catchError, EMPTY, exhaustMap, finalize, map, of, retry, Subject, switchMap, take, takeUntil, tap, throttleTime, throwError } from 'rxjs';

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
  TaskBtEditRequest,
  TaskComplete,
  TaskCompleteResponse,
  TaskCreateRequest,
  TaskCreateResponse,
  TaskEditResponse,
  TaskFileEditRequest,
  TaskList,
  TaskListDeleteResponse,
  TaskListDownloadRequest,
  TaskListDownloadResponse,
  TaskListFilesRequest,
  TaskListFilesResponse,
  TaskListResponse,
} from '@src/models';
import {
  ChromeMessageType,
  ConnectionType,
  FetchError,
  FileListOption,
  LoginError,
  mapToTask,
  NotReadyError,
  Order,
  ServiceInstance,
  TaskCreateType,
  TaskListFilesOrderBy,
  TaskListOption,
  TaskStatus,
  TaskType,
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
  setApi,
  setFiles,
  setLogged,
  setSid,
  setTasks,
  setTaskStats,
  spliceTasks,
} from '@src/store/actions';
import {
  getActiveAndWaitingTasksIdsByActionScope,
  getApi,
  getCredentials,
  getDownloadStation2APITask,
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
import { before, sendMessage, store$, useI18n } from '@src/utils';

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
  private static _destroy$ = new Subject<void>();

  static init(store: StoreOrProxy, source: ServiceInstance, isProxy = false) {
    this.destroy();

    this.store = store;
    this.source = source;
    this.isProxy = isProxy;

    this.infoClient = new SynologyInfoService(isProxy);
    this.authClient = new SynologyAuthService(isProxy);
    this.fileClient = new SynologyFileService(isProxy);
    this.downloadClient = new SynologyDownloadService(isProxy);
    this.download2Client = new SynologyDownload2Service(isProxy);

    store$<string>(store, getUrl)
      .pipe(takeUntil(this._destroy$))
      .subscribe(url => this.setBaseUrl(url));
    store$<string | undefined>(store, getSid)
      .pipe(takeUntil(this._destroy$))
      .subscribe(sid => this.setSid(sid));

    // subscribe to exhaust map for polling
    this.infoHandler.pipe(takeUntil(this._destroy$)).subscribe();
    this.listTaskHandler.pipe(takeUntil(this._destroy$)).subscribe();
    this.listTaskFilesHandler.pipe(takeUntil(this._destroy$)).subscribe();
    this.taskStatisticsHandler.pipe(takeUntil(this._destroy$)).subscribe();

    // TODO - remove this if HTTPS is fixed
    this.autologinQueue
      .pipe(
        throttleTime(1000),
        tap(options => this.autoLogin(options).subscribe()),
        takeUntil(this._destroy$),
      )
      .subscribe();

    LoggerService.debug('Query service initialized', { isProxy });
  }

  static destroy() {
    this._destroy$.next();
    this._destroy$.complete();

    // Restore subject for subsequent-init
    this._destroy$ = new Subject();

    LoggerService.debug('Query service destroyed');
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
    ({ logged, ready }: { logged?: boolean; ready?: boolean } = {}) =>
    <T>(source: Observable<T>) =>
      source.pipe(before(() => this.readyCheck(logged, ready)));

  private static apiCheckOperator = <T>(source: Observable<T>) =>
    source.pipe(
      tap(() => {
        if (Object.keys(getApi(this.store.getState()))?.length) return;
        this.info().subscribe({ error: err => LoggerService.error('Failed to get info', err) });
      }),
    );

  private static loadingOperator =
    ({ logged, ready }: { logged?: boolean; ready?: boolean } = {}) =>
    <T>(source: Observable<T>) =>
      source.pipe(
        this.readyCheckOperator({ logged, ready }),
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

  private static infoRequest: Subject<{ baseUrl?: string; doNotProxy?: boolean }> = new Subject();
  private static infoResponse: Subject<InfoResponse> = new Subject();
  private static infoHandler = this.infoRequest.pipe(
    exhaustMap(({ baseUrl, doNotProxy }) => this.doInfo(baseUrl, doNotProxy)),
    tap({
      next: response => this.infoResponse.next(response),
      error: error => this.infoResponse.next(error),
    }),
    retry(), // re subscribe on error
  );

  private static doInfo(baseUrl?: string, doNotProxy?: boolean): Observable<InfoResponse> {
    return this.infoClient.info(baseUrl, { doNotProxy }).pipe(
      this.readyCheckOperator({ logged: false, ready: !baseUrl?.length }),
      this.handleErrors,
      tap({
        next: info => this.store.dispatch(setApi(info)),
      }),
    );
  }

  static info(baseUrl?: string, doNotProxy?: boolean): Observable<InfoResponse> {
    this.infoRequest.next({ baseUrl, doNotProxy });
    return this.infoResponse.pipe(
      take(1),
      map(res => {
        if (res instanceof Error) throw res;
        return res;
      }),
    );
  }

  private static doLogin(
    credentials = getCredentials(this.store.getState()),
    { baseUrl, doNotProxy }: { baseUrl?: string; doNotProxy?: boolean },
  ): Observable<LoginResponse> {
    const { username, password, authVersion } = credentials;
    if (!username || !password) {
      const error = new Error(
        i18n({
          key: 'login_password_required',
          substitutions: [username ?? '', password ?? ''],
        }),
      );
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
    return this.authClient
      .login(request, authVersion?.toString(), doNotProxy)
      .pipe(this.readyCheckOperator({ logged: false, ready: !baseUrl?.length }));
  }

  private static twoFactorRequest(request: LoginRequest, { otp_code, enable_device_token, device_name, device_id }: Credentials): LoginRequest {
    if ((!enable_device_token && !otp_code) || (!!enable_device_token && !device_name)) {
      throw new Error(
        i18n({
          key: 'otp_code_device_required',
          substitutions: [otp_code ?? 'missing code', device_name ?? 'missing device name'],
        }),
      );
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
      this.loadingOperator({ logged: false, ready: true }),
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

  private static taskStatisticsRequest: Subject<void> = new Subject();
  private static taskStatisticsResponse: Subject<DownloadStationStatistic> = new Subject();
  private static taskStatisticsHandler = this.taskStatisticsRequest.pipe(
    exhaustMap(() => this.doGetStatistic()),
    tap({
      next: response => this.taskStatisticsResponse.next(response),
      error: error => this.taskStatisticsResponse.next(error),
    }),
    retry(), // re subscribe on error
  );

  private static doGetStatistic(): Observable<DownloadStationStatistic> {
    return this.downloadClient.getStatistic().pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap(stats => {
        this.store.dispatch(setTaskStats(stats));
      }),
    );
  }

  static getStatistic(): Observable<DownloadStationStatistic> {
    this.taskStatisticsRequest.next();
    return this.taskStatisticsResponse.pipe(
      take(1),
      map(res => {
        if (res instanceof Error) throw res;
        return res;
      }),
    );
  }

  private static listTaskRequest: Subject<void> = new Subject();
  private static listTaskResponse: Subject<TaskList> = new Subject();
  private static listTaskHandler = this.listTaskRequest.pipe(
    exhaustMap(() => this.doListTasks()),
    tap({
      next: response => this.listTaskResponse.next(response),
      error: error => this.listTaskResponse.next(error),
    }),
    retry(), // re subscribe on error
  );

  static listTasks(): Observable<TaskList> {
    this.listTaskRequest.next();
    return this.listTaskResponse.pipe(
      take(1),
      map(res => {
        if (res instanceof Error) throw res;
        return res;
      }),
    );
  }

  private static doListTasks(): Observable<TaskList> {
    // snapshot task before call
    const extract: ContentStatusTypeId<Task['id']> = getTasksIdsByStatusType(this.store.getState());
    return this.downloadClient.listTasks(0, -1, [TaskListOption.detail, TaskListOption.transfer]).pipe(
      this.loadingOperator(),
      this.apiCheckOperator,
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

  private static listTaskFilesRequest: Subject<TaskListFilesRequest> = new Subject();
  private static listTaskFilesResponse: Subject<TaskListFilesResponse> = new Subject();
  private static listTaskFilesHandler = this.listTaskFilesRequest.pipe(
    exhaustMap(request => this.doListTaskFiles(request)),
    tap({
      next: response => this.listTaskFilesResponse.next(response),
      error: error => this.listTaskFilesResponse.next(error),
    }),
    retry(), // re subscribe on error
  );

  private static doListTaskFiles(request: TaskListFilesRequest): Observable<TaskListFilesResponse> {
    return this.download2Client.getTaskFiles(request).pipe(
      this.readyCheckOperator(),
      this.handleErrors,
      tap({
        next: ({ items }) => {
          this.store.dispatch(setFiles({ taskId: request.task_id, files: items }));
        },
        error: error =>
          LoggerService.error(`Failed to fetch files for task '${request.task_id}'`, {
            request,
            error,
          }),
      }),
    );
  }

  static listTaskFiles(taskId: string, request?: Partial<TaskListFilesRequest>): Observable<TaskListFilesResponse> {
    this.listTaskFilesRequest.next({
      task_id: taskId,
      offset: 0,
      limit: 100,
      order_by: TaskListFilesOrderBy.name,
      order: Order.ASC,
      ...request,
    });
    return this.listTaskFilesResponse.pipe(
      take(1),
      map(res => {
        if (res instanceof Error) throw res;
        return res;
      }),
    );
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

  static createTask(request: Partial<TaskCreateRequest>, options: { source?: string; torrent?: File } = {}): Observable<TaskCreateResponse | void> {
    const { source, torrent } = options;
    const _request: TaskCreateRequest = {
      type: TaskCreateType.url,
      create_list: false,
      ...request,
      destination: request?.destination ?? '',
    };

    let obs$: Observable<TaskCreateResponse | void>;

    const hasDownload2Api = getDownloadStation2APITask(this.store.getState());

    if (hasDownload2Api) obs$ = this.download2Client.createTask(_request);
    else obs$ = this.downloadClient.createTask(_request);

    return obs$.pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap({
        complete: () => {
          this.listTasks().subscribe();
          if (request.destination?.trim()) this.store.dispatch(addDestinationHistory(request.destination?.trim()));
          if (!request?.create_list) NotificationService.taskCreated(torrent?.name ?? request?.url ?? 'unknown', source, request.destination);
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

  static getTaskList(list_id: string): Observable<TaskListResponse> {
    return this.download2Client.getTaskList(list_id).pipe(this.loadingOperator(), this.handleErrors);
  }

  static deleteTaskList(list_id: string): Observable<TaskListDeleteResponse> {
    return this.download2Client.deleteTaskList(list_id).pipe(this.loadingOperator(), this.handleErrors);
  }

  static setTaskListDownload(
    request: TaskListDownloadRequest,
    { name, source }: { name: string; source: string },
  ): Observable<TaskListDownloadResponse> {
    return this.download2Client.setTaskListDownload(request).pipe(
      this.loadingOperator(),
      this.handleErrors,
      tap({
        complete: () => {
          this.listTasks().subscribe();
          NotificationService.taskCreated(name, source, request.destination);
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

  static editTask(type: TaskType, request: TaskBtEditRequest): Observable<CommonResponse[]> {
    let obs$: Observable<CommonResponse[]>;

    const hasDownload2Api = getDownloadStation2APITask(this.store.getState());

    if (!hasDownload2Api) obs$ = this.downloadClient.editTask(request.task_id, request.destination ?? '');
    else if (type === TaskType.bt) obs$ = this.download2Client.editTaskBt(request);
    else obs$ = this.download2Client.editTask({ id: [request.task_id], destination: request.destination });
    return obs$.pipe(
      this.loadingOperator(),
      this.handleErrors,
      finalize(() => {
        if (request.destination?.trim()) this.store.dispatch(addDestinationHistory(request.destination?.trim()));
      }),
      switchMap(res => this.listTasks().pipe(map(() => res))),
    );
  }

  static editTaskFile(request: TaskFileEditRequest): Observable<CommonResponse[]> {
    return this.download2Client.editFile(request).pipe(
      this.loadingOperator(),
      this.handleErrors,
      switchMap(res => this.listTaskFiles(request.task_id).pipe(map(() => res))),
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
