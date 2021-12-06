import { SynologyDownloadService } from '../http';
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
  syncPolling,
} from '../../store';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { EMPTY, Observable, tap } from 'rxjs';
import { CommonResponse, HttpResponse, ListResponse, LoginResponse } from '../../models'; // TODO error handling

// TODO error handling
export class QueryService {
  private static store: any;
  private static downloadClient = new SynologyDownloadService();

  static init(store: Store | ProxyStore) {
    this.store = store;
    console.log('initialising with', store);
    store$(store, getUrl)
      .pipe(tap((url) => console.log('base url changed', url)))
      .subscribe((url) => this.setBaseUrl(url));
  }

  static setBaseUrl(baseUrl: string): void {
    this.downloadClient.setBaseUrl(baseUrl);
  }

  static get isReady() {
    return !!(this.downloadClient && getUrl(this.store.getState())?.length);
  }

  private static readyCheck() {
    if (!QueryService.isReady) throw new Error('Query service is not ready');
  }

  static loginTest(
    username = getUsername(this.store.getState()),
    password = getPassword(this.store.getState())
  ): Observable<HttpResponse<LoginResponse>> {
    this.readyCheck();
    if (!username || !password) throw new Error(`Missing required username '${username}' or password  '${password}'`);
    return this.downloadClient.login(username, password);
  }

  static login(username?: string, password?: string): Observable<HttpResponse<LoginResponse>> {
    return this.loginTest(username, password).pipe(
      tap({
        complete: () => {
          this.store.dispatch(setLogged(true));
          this.store.dispatch(syncPolling({ enabled: true }));
          // TODO: Notification connection success
          console.info('Polling setting change success');
        },
        error: () => {
          this.store.dispatch(setLogged(false));
          this.store.dispatch(syncPolling({ enabled: false }));
          console.error('Login failed');
        },
      })
    );
  }

  static logout(): Observable<HttpResponse<void>> {
    this.readyCheck();
    return this.downloadClient.logout().pipe(
      tap(() => {
        this.store.dispatch(setLogged(false));
        this.store.dispatch(syncPolling({ enabled: false }));
        // TODO: Notification logout success
        console.info('Polling setting change success');
      })
    );
  }

  static listTasks(): Observable<HttpResponse<ListResponse>> {
    this.readyCheck();
    return this.downloadClient.listTasks().pipe(tap((res) => this.store.dispatch(setTasks(res?.data?.tasks))));
  }

  static resumeTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
    this.readyCheck();
    return this.downloadClient.resumeTask(id).pipe(tap((res) => this.listTasks().subscribe()));
  }

  static resumeAllTasks(ids: string[] = getPausedTasksIds(this.store.getState())): Observable<HttpResponse<CommonResponse[]>> {
    return ids?.length ? this.resumeTask(ids.join(',')) : EMPTY;
  }

  static pauseTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
    this.readyCheck();
    return this.downloadClient.pauseTask(id).pipe(tap((res) => this.listTasks().subscribe()));
  }

  static pauseAllTasks(ids: string[] = getActiveTasksIds(this.store.getState())): Observable<HttpResponse<CommonResponse[]>> {
    return ids?.length ? this.pauseTask(ids.join(',')) : EMPTY;
  }

  static createTask(uri: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<HttpResponse<void>> {
    this.readyCheck();
    return this.downloadClient.createTask(uri, destination, username, password, unzip).pipe(
      tap({
        complete: () => {
          // TODO notification
          console.info('task successfully created');
          this.listTasks().subscribe();
        },
        error: (err) => console.error('task failed to create', err),
      })
    );
  }

  static editTask(id: string | string[], destination: string): Observable<HttpResponse<CommonResponse[]>> {
    this.readyCheck();
    return this.downloadClient.editTask(id, destination).pipe(tap((res) => this.listTasks().subscribe()));
  }

  static deleteTask(id: string | string[], force = false): Observable<HttpResponse<CommonResponse[]>> {
    this.readyCheck();
    return this.downloadClient.deleteTask(id, force).pipe(tap((res) => this.listTasks().subscribe()));
  }

  static deleteAllTasks(ids: string[] = getTasksIds(this.store.getState()), force = false): Observable<HttpResponse<CommonResponse[]>> {
    return ids?.length ? this.deleteTask(ids.join(',')) : EMPTY;
  }

  static deleteFinishedTasks(ids: string[] = getFinishedTasksIds(this.store.getState()), force = false): Observable<HttpResponse<CommonResponse[]>> {
    return this.deleteAllTasks(ids, force);
  }
}