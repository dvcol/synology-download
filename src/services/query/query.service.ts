import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import { NotificationService } from '@src/services';
import {
  getActiveTasksIds,
  getErrorTasksIds,
  getFinishedTasksIds,
  getNotificationsBannerFailedEnabled,
  getNotificationsBannerFinishedEnabled,
  getPassword,
  getPausedTasksIds,
  getTasksIds,
  getUrl,
  getUsername,
} from '@src/store/selectors';
import { addLoading, removeLoading, setLogged, setTasks, spliceTasks } from '@src/store/actions';
import { store$ } from '@src/store';
import {
  ChromeMessageType,
  CommonResponse,
  DownloadStationConfig,
  FileList,
  FileListOption,
  FolderList,
  InfoResponse,
  LoginResponse,
  StoreOrProxy,
  SynologyError,
  Task,
  TaskList,
  TaskListOption,
  TaskStatus,
} from '@src/models';
import { before, onMessage, sendMessage } from '@src/utils';
import { EMPTY, finalize, Observable, tap } from 'rxjs';

// TODO error handling
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

    if (!isProxy) {
      store$(store, getUrl).subscribe((url) => this.setBaseUrl(url));
      onMessage<string>([ChromeMessageType.baseUrl], true).subscribe(({ message: { payload }, sendResponse }) => {
        if (payload) this.setBaseUrl(payload);
        sendResponse();
      });
    }
  }

  static setBaseUrl(baseUrl: string): void {
    if (this.isProxy) {
      sendMessage<string>({ type: ChromeMessageType.baseUrl, payload: baseUrl }).subscribe();
    } else {
      this.baseUrl = baseUrl;
      this.infoClient.setBaseUrl(baseUrl);
      this.authClient.setBaseUrl(baseUrl);
      this.fileClient.setBaseUrl(baseUrl);
      this.downloadClient.setBaseUrl(baseUrl);
    }
  }

  static setSid(sid?: string): void {
    this.infoClient.setSid(sid);
    this.authClient.setSid(sid);
    this.fileClient.setSid(sid);
    this.downloadClient.setSid(sid);
  }

  static get isReady() {
    return this.isProxy || !!this.baseUrl?.length;
  }

  private static readyCheck() {
    if (!QueryService.isReady) throw new Error('Query service is not ready');
  }

  private static readyCheckOperator = <T>(source: Observable<T>) => source.pipe(before(this.readyCheck));

  private static loadingOperator = <T>(source: Observable<T>) =>
    source.pipe(
      this.readyCheckOperator,
      before(() => this.store.dispatch(addLoading())),
      finalize(() => this.store.dispatch(removeLoading()))
    );

  static info(): Observable<InfoResponse> {
    return this.infoClient.info().pipe(this.loadingOperator);
  }

  static loginTest(username = getUsername(this.store.getState()), password = getPassword(this.store.getState())): Observable<LoginResponse> {
    if (!username || !password) throw new Error(`Missing required username '${username}' or password  '${password}'`);
    return this.authClient.login(username, password).pipe(
      this.readyCheckOperator,
      tap({
        error: (error) => {
          if (error instanceof SynologyError) {
            console.error('Login failed', error?.api, error?.code, error?.message);
          } else {
            console.error('Login failed', error);
          }
        },
      })
    );
  }

  static login(username?: string, password?: string): Observable<LoginResponse> {
    return this.loginTest(username, password).pipe(
      tap({
        next: ({ sid }) => {
          this.setSid(sid);
          this.store.dispatch(setLogged(true));
        },
        error: () => {
          this.store.dispatch(setLogged(false));
        },
      })
    );
  }

  static logout(): Observable<void> {
    return this.authClient.logout().pipe(
      this.readyCheckOperator,
      tap(() => {
        this.setSid();
        this.store.dispatch(setLogged(false));
      })
    );
  }

  static listFolders(readonly = true): Observable<FolderList> {
    return this.fileClient.listFolder(0, 0, readonly).pipe(this.readyCheckOperator);
  }

  static listFiles(folderPath: string, filetype: 'all' | 'dir' = 'dir'): Observable<FileList> {
    return this.fileClient.listFile(folderPath, 0, 0, filetype, [FileListOption.perm]).pipe(this.readyCheckOperator);
  }

  static config(): Observable<DownloadStationConfig> {
    return this.downloadClient.config().pipe(this.readyCheckOperator);
  }

  static listTasks(): Observable<TaskList> {
    // snapshot task before call
    const extract = this.extract();
    return this.downloadClient.listTasks(0, -1, [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer]).pipe(
      this.loadingOperator,
      tap(({ tasks }) => {
        // notify if we have tasks
        this.notifyTasks(extract, tasks);
        this.store.dispatch(setTasks(tasks));
      })
    );
  }

  private static extract(state = this.store.getState()): { finishedIds: Set<string>; errorIds: Set<string> } {
    return { finishedIds: new Set(getFinishedTasksIds(state)), errorIds: new Set(getErrorTasksIds(state)) };
  }

  // TODO : group notifications
  private static notifyTasks(
    { finishedIds, errorIds }: { finishedIds: Set<string>; errorIds: Set<string> },
    tasks: Task[],
    state = this.store.getState()
  ): void {
    tasks?.forEach((t) => {
      if (getNotificationsBannerFinishedEnabled(state) && TaskStatus.finished === t.status && !finishedIds.has(t.id)) {
        NotificationService.taskFinished(t);
      } else if (getNotificationsBannerFailedEnabled(state) && TaskStatus.error === t.status && !errorIds.has(t.id)) {
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

  static resumeAllTasks(ids: string[] = getPausedTasksIds(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.length ? this.resumeTask(ids.join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    return this.downloadClient.pauseTask(id).pipe(
      this.loadingOperator,
      tap(() => this.listTasks().subscribe())
    );
  }

  static pauseAllTasks(ids: string[] = getActiveTasksIds(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.length ? this.pauseTask(ids.join(',')) : EMPTY;
  }

  static createTask(uri: string, source?: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      this.loadingOperator,
      tap({
        complete: () => {
          this.listTasks().subscribe();
          NotificationService.taskCreated(uri, source, destination);
        },
        error: (err) => {
          console.error('task failed to create', err);
          NotificationService.error({ title: err, message: 'Failed to add download task', contextMessage: source });
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

  static deleteAllTasks(ids: string[] = getTasksIds(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return ids?.length ? this.deleteTask(ids.join(','), force) : EMPTY;
  }

  static deleteFinishedTasks(ids: string[] = getFinishedTasksIds(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return this.deleteAllTasks(ids, force);
  }
}
