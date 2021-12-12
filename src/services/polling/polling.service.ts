import { distinctUntilChanged, Subject, switchMap, timer } from 'rxjs';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { getLogged, getPollingEnabled, getPollingInterval, getTasksCount, setTasksCount, store$ } from '../../store';
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
    switchMap((interval) => timer(0, interval).pipe(skipUntilRepeat(() => !this.enabled, this.stop$, this.start$)))
  );

  static get enabled(): boolean {
    return QueryService.isReady && getLogged(this.store.getState()) && getPollingEnabled(this.store.getState());
  }

  static get interval(): number {
    return getPollingInterval(this.store.getState()) ?? defaultPolling.background.interval;
  }

  static init(store: Store | ProxyStore): void {
    this.store = store;
    this.timer$.subscribe(() => QueryService.listTasks().subscribe());

    store$(this.store, getPollingInterval).subscribe(() => this.change(this.interval));
    store$(this.store, getPollingEnabled).subscribe((enabled) => (enabled ? this.start() : this.stop()));
    store$(this.store, getTasksCount).subscribe((count) => this.store.dispatch(setTasksCount(count)));
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
