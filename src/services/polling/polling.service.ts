import { distinctUntilChanged, repeatWhen, skipWhile, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { getInterval, getPollingEnabled, store$ } from '../../store';
import { defaultPolling } from '../../models';
import { QueryService } from '../query';

export class PollingService {
  private static store: any;

  private static readonly stop$ = new Subject<void>();
  private static readonly start$ = new Subject<void>();
  private static readonly change$ = new Subject<number>();

  static readonly timer$ = this.change$.pipe(
    distinctUntilChanged(),
    switchMap((interval) =>
      timer(0, interval).pipe(
        skipWhile(() => !this.enabled),
        takeUntil(this.stop$),
        repeatWhen(() => this.start$),
        tap(() => console.log('polling every', this.interval))
      )
    )
  );

  static init(store: Store | ProxyStore): void {
    this.store = store;
    this.timer$.subscribe(() => QueryService.listTasks().subscribe());

    store$(this.store, getInterval)
      .pipe(tap((polling) => console.log('polling changed', polling)))
      .subscribe(() => this.change(this.interval));

    store$(this.store, getPollingEnabled)
      .pipe(tap((enabled) => console.log('enabled changed', enabled)))
      .subscribe((enabled) => {
        if (enabled) {
          console.log('starting');
          this.start();
        } else {
          console.log('stopping');
          this.stop();
        }
      });
  }

  static get enabled(): boolean {
    return QueryService.isReady && getPollingEnabled(this.store.getState());
  }

  static get interval(): number {
    return getInterval(this.store.getState()) ?? defaultPolling.popup;
  }

  static start(): void {
    this.start$.next();
  }

  static stop(): void {
    this.stop$.next();
  }

  static change(interval: number): void {
    return this.change$.next(interval);
  }
}
