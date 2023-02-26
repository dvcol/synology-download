import { catchError, EMPTY, from, map, of, tap, throwError } from 'rxjs';

import type { Download, DownloadOptions, DownloadQuery, DownloadQueryPayload, StoreOrProxy } from '@src/models';
import { ChromeMessageType, mapToDownload } from '@src/models';
import { setDownloads } from '@src/store/actions';
import { cancel, download, erase, getFileIcon, onMessage, open, pause, resume, search, sendMessage, show, showDefaultFolder } from '@src/utils';

import type { Observable } from 'rxjs';

export class DownloadService {
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;

  static listen(name = DownloadService.name): void {
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
      return true;
    });
  }
  static forward<T>(method: DownloadQueryPayload['method'], ...args: DownloadQueryPayload['args']): Observable<T> {
    return sendMessage<DownloadQueryPayload, T>({ type: ChromeMessageType.download, payload: { id: DownloadService.name, method, args } });
  }

  static do(method: DownloadQueryPayload['method'], ...args: DownloadQueryPayload['args']): Observable<any> {
    if (!(method in this)) return throwError(() => new Error(`Method '${method}' is unknown.`));
    return this[method](...args);
  }

  static init(store: StoreOrProxy, isProxy = false) {
    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) this.listen();
  }

  static search(query: DownloadQuery = {}): Observable<Download[]> {
    if (this.isProxy) return this.forward<Download[]>('search', query);
    return from(search(query)).pipe(
      map(items => items.map(mapToDownload)),
      tap(items => {
        this.store.dispatch(setDownloads(items));
      }),
    );
  }

  static erase(query: DownloadQuery = {}): Observable<number[]> {
    if (this.isProxy) return this.forward<number[]>('erase', query);
    return from(erase(query)).pipe(tap(() => this.search().subscribe()));
  }

  static download(options: DownloadOptions): Observable<number> {
    if (this.isProxy) return this.forward<number>('download', options);
    return from(download(options)).pipe(tap(() => this.search().subscribe()));
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
    console.info('show', { id, do: id !== undefined });
    if (this.isProxy) return this.forward<void>('show', id);
    return EMPTY.pipe(tap({ complete: () => (id !== null && id !== undefined ? show(id) : showDefaultFolder()) }));
  }

  static pause(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('pause', id);
    return from(pause(id)).pipe(tap(() => this.search().subscribe()));
  }

  static resume(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('resume', id);
    return from(resume(id)).pipe(tap(() => this.search().subscribe()));
  }

  static cancel(id: number): Observable<void> {
    if (this.isProxy) return this.forward<void>('cancel', id);
    return from(cancel(id)).pipe(tap(() => this.search().subscribe()));
  }
}
