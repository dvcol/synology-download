import { catchError, EMPTY, forkJoin, from, map, of, tap, throwError } from 'rxjs';

import type { Download, DownloadQueryPayload, StoreOrProxy } from '@src/models';
import { ChromeMessageType, mapToDownload } from '@src/models';
import { LoggerService } from '@src/services';
import { setDownloads } from '@src/store/actions';
import {
  getActiveDownloadIdsByActionScope,
  getDownloadingDownloadIdsByActionScope,
  getFinishedDownloadIdsByActionScope,
  getPausedDownloadIdsByActionScope,
} from '@src/store/selectors';
import type { DownloadOptions, DownloadQuery } from '@src/utils';
import { cancel, download, erase, getFileIcon, onMessage, open, pause, resume, search, sendMessage, show, showDefaultFolder } from '@src/utils';

import type { Observable } from 'rxjs';

export class DownloadService {
  private static key = 'DownloadService';
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;

  static listen(name = this.key): void {
    onMessage<DownloadQueryPayload>([ChromeMessageType.download]).subscribe(({ message: { payload }, sendResponse }) => {
      if (payload?.id === name) {
        const { method, args } = payload;
        this.do(method, ...(args ?? []))
          .pipe(
            map(response => ({ success: true, payload: response })),
            catchError(error => of({ success: false, error })),
          )
          .subscribe(response => sendResponse(response));
      }
    });
  }
  static forward<T>(method: DownloadQueryPayload['method'], ...args: DownloadQueryPayload['args']): Observable<T> {
    return sendMessage<DownloadQueryPayload, T>({ type: ChromeMessageType.download, payload: { id: this.key, method, args } });
  }

  static do(method: DownloadQueryPayload['method'], ...args: DownloadQueryPayload['args']): Observable<any> {
    if (!(method in this)) return throwError(() => new Error(`Method '${method}' is unknown.`));
    return this[method].bind(this)(...(args as [any]));
  }

  static init(store: StoreOrProxy, isProxy = false) {
    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) this.listen();

    LoggerService.debug('Download service initialized', { isProxy });
  }

  static search(query: DownloadQuery = {}): Observable<Download[]> {
    if (this.isProxy) return this.forward<Download[]>('search', query);
    return from(search(query)).pipe(map(items => items.map(mapToDownload)));
  }

  static searchAll(): Observable<Download[]> {
    if (this.isProxy) return this.forward<Download[]>('searchAll');
    return from(search({})).pipe(
      map(items => items.map(mapToDownload)),
      tap(items => this.store.dispatch(setDownloads(items))),
    );
  }

  static erase(query: DownloadQuery = {}): Observable<number[]> {
    if (this.isProxy) return this.forward<number[]>('erase', query);
    return from(erase(query)).pipe(tap(() => this.searchAll().subscribe()));
  }

  static eraseAll(ids: number[] = getFinishedDownloadIdsByActionScope(this.store.getState())): Observable<number[]> {
    if (this.isProxy) return this.forward<number[]>('eraseAll', ids);
    return forkJoin(ids.map(id => this.erase({ id }))).pipe(
      map(results => results?.flat()),
      tap(() => this.searchAll().subscribe()),
    );
  }

  static download(options: DownloadOptions): Observable<number> {
    if (this.isProxy) return this.forward<number>('download', options);
    return from(download(options)).pipe(tap(() => this.searchAll().subscribe()));
  }

  static getFileIcon(id: number): Observable<string> {
    if (this.isProxy) return this.forward<string>('getFileIcon', id);
    return from(getFileIcon(id));
  }

  static open(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('open', id);
    return EMPTY.pipe(tap({ complete: () => open(id) }));
  }

  static show(id?: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('show', id);
    return EMPTY.pipe(tap({ complete: () => (id !== null && id !== undefined ? show(id) : showDefaultFolder()) }));
  }

  static pause(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('pause', id);
    return from(pause(id)).pipe(tap(() => this.searchAll().subscribe()));
  }

  static pauseAll(ids: number[] = getDownloadingDownloadIdsByActionScope(this.store.getState())): Observable<number> {
    if (this.isProxy) return this.forward<number>('pauseAll', ids);
    return forkJoin(ids.map(this.pause.bind(this))).pipe(
      map(results => results?.length),
      tap(() => this.searchAll().subscribe()),
    );
  }

  static resume(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('resume', id);
    return from(resume(id)).pipe(tap(() => this.searchAll().subscribe()));
  }

  static resumeAll(ids: number[] = getPausedDownloadIdsByActionScope(this.store.getState())): Observable<number> {
    if (this.isProxy) return this.forward<number>('resumeAll', ids);
    return forkJoin(ids.map(this.resume.bind(this))).pipe(
      map(results => results?.length),
      tap(() => this.searchAll().subscribe()),
    );
  }

  static cancel(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('cancel', id);
    return from(cancel(id)).pipe(tap(() => this.searchAll().subscribe()));
  }

  static cancelAll(ids: number[] = getActiveDownloadIdsByActionScope(this.store.getState())): Observable<number> {
    if (this.isProxy) return this.forward<number>('cancelAll', ids);
    return forkJoin(ids.map(this.cancel.bind(this))).pipe(
      map(results => results?.length),
      tap(() => this.searchAll().subscribe()),
    );
  }
}
