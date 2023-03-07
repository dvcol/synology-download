import { combineLatest, distinctUntilChanged, Subject, switchMap, timer, withLatestFrom } from 'rxjs';

import type { ChromeNotification, StoreOrProxy } from '@src/models';
import { ChromeMessageType, defaultPolling } from '@src/models';
import { DownloadService } from '@src/services';
import { store$ } from '@src/store';
import { getLogged, getPollingEnabled, getPollingInterval, getSettingsDownloadsEnabled } from '@src/store/selectors';
import { onMessage, sendMessage, skipUntilRepeat } from '@src/utils';

import { QueryService } from '../query';

export class PollingService {
  private static store: any | StoreOrProxy;

  private static isProxy: boolean;

  private static readonly stop$ = new Subject<void>();

  private static readonly start$ = new Subject<void>();

  private static readonly change$ = new Subject<number>();

  static readonly timer$ = this.change$.pipe(
    distinctUntilChanged(),
    switchMap(interval => timer(0, interval).pipe(skipUntilRepeat(() => !this.isReady(), this.stop$, this.start$))),
  );

  private static isReady(): boolean {
    return (QueryService.isLoggedIn || getSettingsDownloadsEnabled(this.store.getState())) && getPollingEnabled(this.store.getState());
  }

  private static interval(): number {
    return getPollingInterval(this.store.getState()) ?? defaultPolling.background.interval;
  }

  static init(store: StoreOrProxy, isProxy = false) {
    this.store = store;
    this.isProxy = isProxy;

    onMessage<ChromeNotification>([ChromeMessageType.polling]).subscribe(({ message: { payload }, sendResponse }) => {
      (payload ? this.start$ : this.stop$).next();
      sendResponse();
    });

    if (!this.isProxy) {
      this.timer$
        .pipe(withLatestFrom(store$(this.store, getLogged), store$(this.store, getSettingsDownloadsEnabled)))
        .subscribe(([_, logged, download]) => {
          if (download) DownloadService.searchAll().subscribe();
          if (logged) {
            QueryService.listTasks().subscribe();
            QueryService.getStatistic().subscribe();
          }
        });

      store$<number>(this.store, getPollingInterval).subscribe(() => this.change(this.interval()));
      combineLatest([
        store$(this.store, getPollingEnabled),
        store$(this.store, getLogged),
        store$(this.store, getSettingsDownloadsEnabled),
      ]).subscribe(([enabled, logged, download]) => (enabled && (download || logged) ? this.start() : this.stop()));
    }

    console.debug('Polling service initialized', { isProxy });
  }

  static start(): void {
    if (this.isProxy) {
      sendMessage<boolean>({ type: ChromeMessageType.polling, payload: true }).subscribe();
    } else {
      this.start$.next();
    }
  }

  static stop(): void {
    if (this.isProxy) {
      sendMessage<boolean>({ type: ChromeMessageType.polling, payload: false }).subscribe();
    } else {
      this.stop$.next();
    }
  }

  static change(interval: number): void {
    return this.change$.next(interval);
  }
}
