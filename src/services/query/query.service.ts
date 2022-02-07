import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '@src/services/http';
import { NotificationService } from '@src/services';
import { getActiveTasksIds, getFinishedTasksIds, getPassword, getPausedTasksIds, getTasksIds, getUrl, getUsername } from '@src/store/selectors';
import { setLogged, setTasks, spliceTasks } from '@src/store/actions';
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
  TaskList,
  TaskListOption,
} from '@src/models';
import { onMessage, sendMessage } from '@src/utils';
import { EMPTY, Observable, tap } from 'rxjs';

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

  static info(): Observable<InfoResponse> {
    this.readyCheck();
    return this.infoClient.info();
  }

  static loginTest(username = getUsername(this.store.getState()), password = getPassword(this.store.getState())): Observable<LoginResponse> {
    this.readyCheck();
    if (!username || !password) throw new Error(`Missing required username '${username}' or password  '${password}'`);
    return this.authClient.login(username, password).pipe(
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
    this.readyCheck();
    return this.authClient.logout().pipe(
      tap(() => {
        this.setSid();
        this.store.dispatch(setLogged(false));
      })
    );
  }

  static listFolders(readonly = true): Observable<FolderList> {
    this.readyCheck();
    return this.fileClient.listFolder(0, 0, readonly);
  }

  static listFiles(folderPath: string, filetype: 'all' | 'dir' = 'dir'): Observable<FileList> {
    this.readyCheck();
    return this.fileClient.listFile(folderPath, 0, 0, filetype, [FileListOption.perm]);
  }

  static config(): Observable<DownloadStationConfig> {
    this.readyCheck();
    return this.downloadClient.config();
  }

  static listTasks(): Observable<TaskList> {
    this.readyCheck();
    return this.downloadClient
      .listTasks(0, -1, [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer])
      .pipe(tap(({ tasks }) => this.store.dispatch(setTasks(tasks))));
  }

  static resumeTask(id: string | string[]): Observable<CommonResponse[]> {
    this.readyCheck();
    return this.downloadClient.resumeTask(id).pipe(tap(() => this.listTasks().subscribe()));
  }

  static resumeAllTasks(ids: string[] = getPausedTasksIds(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.length ? this.resumeTask(ids.join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    this.readyCheck();
    return this.downloadClient.pauseTask(id).pipe(tap(() => this.listTasks().subscribe()));
  }

  static pauseAllTasks(ids: string[] = getActiveTasksIds(this.store.getState())): Observable<CommonResponse[]> {
    return ids?.length ? this.pauseTask(ids.join(',')) : EMPTY;
  }

  static createTask(uri: string, source?: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    this.readyCheck();
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      tap({
        complete: () => {
          this.listTasks().subscribe();
          NotificationService.create(uri, source, destination);
        },
        error: (err) => {
          console.error('task failed to create', err);
          NotificationService.error({ title: err, message: 'Failed to add download task', contextMessage: source });
        },
      })
    );
  }

  static editTask(id: string | string[], destination: string): Observable<CommonResponse[]> {
    this.readyCheck();
    return this.downloadClient.editTask(id, destination).pipe(tap(() => this.listTasks().subscribe()));
  }

  static deleteTask(id: string | string[], force = false): Observable<CommonResponse[]> {
    this.readyCheck();
    return this.downloadClient.deleteTask(id, force).pipe(
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
