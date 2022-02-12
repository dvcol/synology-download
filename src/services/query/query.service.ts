import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import { NotificationService } from '@src/services';
import {
  getActiveTasksIdsByActionScope,
  geTasksIdsByStatusType,
  getFinishedTasksIdsByActionScope,
  getNotificationsBannerFailedEnabled,
  getNotificationsBannerFinishedEnabled,
  getPassword,
  getPausedTasksIdsByActionScope,
  getTasksIdsByActionScope,
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
  TaskStatusType,
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
