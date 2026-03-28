import type { Observable } from 'rxjs';

import type { Download, DownloadQueryPayload } from '../../models/download.model';
import type { StoreOrProxy } from '../../models/store.model';
import type { DownloadOptions, DownloadQuery } from '../../utils/chrome/chrome-download.utils';

import { catchError, EMPTY, forkJoin, from, map, of, Subject, takeUntil, tap, throwError } from 'rxjs';

import { mapToDownload } from '../../models/download.model';
import { ChromeMessageType } from '../../models/message.model';
import { setDownloads } from '../../store/actions/downloads.action';
import { getActiveDownloadIdsByActionScope, getDownloadingDownloadIdsByActionScope, getFinishedDownloadIdsByActionScope, getPausedDownloadIdsByActionScope } from '../../store/selectors/composite.selector';
import { cancel, download, erase, getFileIcon, open, pause, resume, search, show, showDefaultFolder } from '../../utils/chrome/chrome-download.utils';
import { onMessage, sendMessage } from '../../utils/chrome/chrome-message.utils';
import { LoggerService } from '../logger/logger.service';

export class DownloadService {
  private static key = 'DownloadService';
  private static store: StoreOrProxy;
  private static isProxy: boolean;
  private static _destroy$ = new Subject<void>();

  static listen(name = this.key): void {
    onMessage<DownloadQueryPayload>([ChromeMessageType.download])
      .pipe(takeUntil(this._destroy$))
      .subscribe(({ message: { payload }, sendResponse }) => {
        if (payload?.id === name) {
          const { method, args } = payload;
          this.do(method, ...(args ?? []))
            .pipe(
              map((response: DownloadQueryPayload) => ({ success: true, payload: response })),
              catchError((error: Error) => of({ success: false, error })),
              takeUntil(this._destroy$),
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
    return this[method].bind(this)(...(args as [DownloadQuery & number & number[] & DownloadOptions]));
  }

  static init(store: StoreOrProxy, isProxy = false) {
    this.destroy();

    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) this.listen();

    LoggerService.debug('Download service initialized', { isProxy });
  }

  static destroy() {
    this._destroy$.next();
    this._destroy$.complete();

    // Restore subject for subsequent-init
    this._destroy$ = new Subject();

    LoggerService.debug('Download service destroyed');
  }

  static search(query: DownloadQuery = {}): Observable<Download[]> {
    if (this.isProxy) return this.forward<Download[]>('search', query);
    return from(search(query)).pipe(map(items => items.map(mapToDownload)));
  }

  static searchAll(): Observable<Download[]> {
    if (this.isProxy) return this.forward<Download[]>('searchAll');
    return from(search({})).pipe(
      map(items => items.map(mapToDownload)),
      tap(async items => this.store.dispatch(setDownloads(items))),
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
