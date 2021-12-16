import { SynologyAuthService, SynologyDownloadService, SynologyFileService, SynologyInfoService } from '../http';
import {
  getActiveTasksIds,
  getFinishedTasksIds,
  getPassword,
  getPausedTasksIds,
  getTasksIds,
  getUrl,
  getUsername,
  setLogged,
  setTasks,
  store$,
} from '../../store';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { EMPTY, Observable, tap } from 'rxjs';
import { CommonResponse, InfoResponse, ListResponse, LoginResponse, SynologyError } from '../../models';
import { NotificationService } from '../notification';

// TODO error handling
export class QueryService {
  private static store: any | Store | ProxyStore;

  private static infoClient = new SynologyInfoService();
  private static authClient = new SynologyAuthService();
  private static fileClient = new SynologyFileService();
  private static downloadClient = new SynologyDownloadService();

  private static baseUrl: string;

  static init(store: Store | ProxyStore) {
    this.store = store;
    store$(store, getUrl).subscribe((url) => this.setBaseUrl(url));
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

  static listTasks(): Observable<ListResponse> {
    this.readyCheck();
    return this.downloadClient.listTasks().pipe(tap(({ tasks }) => this.store.dispatch(setTasks(tasks))));
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
          NotificationService.error(err, 'Failed to add download task', source);
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
    return this.downloadClient.deleteTask(id, force).pipe(tap(() => this.listTasks().subscribe()));
  }

  static deleteAllTasks(ids: string[] = getTasksIds(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return ids?.length ? this.deleteTask(ids.join(','), force) : EMPTY;
  }

  static deleteFinishedTasks(ids: string[] = getFinishedTasksIds(this.store.getState()), force = false): Observable<CommonResponse[]> {
    return this.deleteAllTasks(ids, force);
  }
}
