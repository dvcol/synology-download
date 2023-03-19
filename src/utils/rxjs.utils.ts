import { BehaviorSubject, distinctUntilChanged, finalize, map } from 'rxjs';

import type { BeforeOperator, BufferDebounceUnless, SkipUntilRepeat } from '@dvcol/web-extension-utils';
import { before as _before, bufferDebounceUnless as _bufferDebounceUnless, skipUntilRepeat as _skipUntilRepeat } from '@dvcol/web-extension-utils';

import type { RootSlice, StoreOrProxy } from '@src/models';

/**
 * Rxjs operator that start emitting when skip condition is falsy, keeps emitting until stop$ emits and restart emitting if start$ emits.
 * @param skip a boolean function
 * @param stop$ a stream notifier
 * @param start$ a stream notifier
 */
export const skipUntilRepeat: SkipUntilRepeat = _skipUntilRepeat;

/**
 * Rxjs operator function that buffer source observable until debounce condition is reached or buffer size reach limit
 * @param debounce time in ms before emitting
 * @param limit number of emission to buffer
 */
export const bufferDebounceUnless: BufferDebounceUnless = _bufferDebounceUnless;

/**
 * Before Operator which execute callback before observable stream subscription
 * @param callback the callback to execute
 */
export const before: BeforeOperator = _before;

/**
 * Rxjs wrapper for store subscriptions
 * @param _store a store or proxy tore instance
 * @param getter the getter to extract a slice
 */
export const store$ = <R, T = RootSlice>(_store: StoreOrProxy, getter: (state: T) => R) => {
  const _store$ = new BehaviorSubject<T>(_store.getState());
  const unsubscribe = _store.subscribe(() => _store$.next(_store.getState()));
  return _store$.pipe(map<T, R>(getter), distinctUntilChanged(), finalize(unsubscribe));
};
