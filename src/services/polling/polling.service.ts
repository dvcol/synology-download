import { distinctUntilChanged, repeatWhen, skipWhile, Subject, switchMap, takeUntil, timer } from 'rxjs';
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
        repeatWhen(() => this.start$)
      )
    )
  );

  static init(store: Store | ProxyStore): void {
    this.store = store;
    this.timer$.subscribe(() => QueryService.listTasks().subscribe());

    store$(this.store, getInterval).subscribe(() => this.change(this.interval));
    store$(this.store, getPollingEnabled).subscribe((enabled) => (enabled ? this.start() : this.stop()));
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
