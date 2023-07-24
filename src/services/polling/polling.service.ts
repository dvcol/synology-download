import { combineLatest, distinctUntilChanged, Subject, switchMap, takeUntil, timer, withLatestFrom } from 'rxjs';

import type { ChromeNotification, StoreOrProxy } from '@src/models';
import { ChromeMessageType, defaultPolling } from '@src/models';
import { DownloadService, LoggerService } from '@src/services';
import { getLogged, getPollingEnabled, getPollingInterval, getSettingsDownloadsEnabled } from '@src/store/selectors';
import { onMessage, sendMessage, skipUntilRepeat, store$ } from '@src/utils';

import { QueryService } from '../query';

export class PollingService {
  private static store: any | StoreOrProxy;

  private static isProxy: boolean;

  private static readonly stop$ = new Subject<void>();

  private static readonly start$ = new Subject<void>();

  private static readonly change$ = new Subject<number>();

  private static _destroy$ = new Subject<void>();

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
    this.destroy();

    this.store = store;
    this.isProxy = isProxy;

    onMessage<ChromeNotification>([ChromeMessageType.polling])
      .pipe(takeUntil(this._destroy$))
      .subscribe(({ message: { payload }, sendResponse }) => {
        (payload ? this.start$ : this.stop$).next();
        sendResponse();
      });

    if (!this.isProxy) {
      this.timer$
        .pipe(withLatestFrom(store$(this.store, getLogged), store$(this.store, getSettingsDownloadsEnabled)), takeUntil(this._destroy$))
        .subscribe(([_, logged, download]) => {
          if (download) DownloadService.searchAll().pipe(takeUntil(this._destroy$)).subscribe();
          if (logged) {
            QueryService.listTasks()
              .pipe(takeUntil(this._destroy$))
              .subscribe({
                error: err => {
                  this.stop();
                  LoggerService.error('Polling service failed to fetch list', err);
                },
              });
            QueryService.getStatistic()
              .pipe(takeUntil(this._destroy$))
              .subscribe({
                error: err => {
                  this.stop();
                  LoggerService.error('Polling service failed to fetch statistics', err);
                },
              });
          }
        });

      store$<number>(this.store, getPollingInterval)
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => this.change(this.interval()));
      combineLatest([store$(this.store, getPollingEnabled), store$(this.store, getLogged), store$(this.store, getSettingsDownloadsEnabled)])
        .pipe(takeUntil(this._destroy$))
        .subscribe(([enabled, logged, download]) => (enabled && (download || logged) ? this.start() : this.stop()));
    }

    LoggerService.debug('Polling service initialized', { isProxy });
  }

  static destroy() {
    this._destroy$.next();
    this._destroy$.complete();

    // Restore subject for subsequent-init
    this._destroy$ = new Subject();

    LoggerService.debug('Polling service destroyed');
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
