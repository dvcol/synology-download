import { combineLatest, distinctUntilChanged, Subject, switchMap, timer } from 'rxjs';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { getLogged, getPollingEnabled, getPollingInterval, store$ } from '../../store';
import { defaultPolling } from '../../models';
import { QueryService } from '../query';
import { skipUntilRepeat } from '../../utils';

export class PollingService {
  private static store: any | Store | ProxyStore;

  private static readonly stop$ = new Subject<void>();
  private static readonly start$ = new Subject<void>();
  private static readonly change$ = new Subject<number>();

  static readonly timer$ = this.change$.pipe(
    distinctUntilChanged(),
    switchMap((interval) => timer(0, interval).pipe(skipUntilRepeat(() => !this.isReady(), this.stop$, this.start$)))
  );

  private static isReady(): boolean {
    return QueryService.isReady && getLogged(this.store.getState()) && getPollingEnabled(this.store.getState());
  }

  private static interval(): number {
    return getPollingInterval(this.store.getState()) ?? defaultPolling.background.interval;
  }

  static init(store: Store | ProxyStore): void {
    this.store = store;
    this.timer$.subscribe(() => QueryService.listTasks().subscribe());

    store$(this.store, getPollingInterval).subscribe(() => this.change(this.interval()));
    combineLatest([store$(this.store, getPollingEnabled), store$(this.store, getLogged)]).subscribe(([enabled, logged]) =>
      enabled && logged ? this.start() : this.stop()
    );
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
