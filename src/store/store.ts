import { ReducersMapObject, Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { navbarSlice, settingsSlice, stateSlice, tasksSlice } from './slices';
import { RootSlice } from '@src/models';
import { BehaviorSubject, distinctUntilChanged, finalize, map } from 'rxjs';

export const proxyStore = new ProxyStore();

const reducers: ReducersMapObject<RootSlice> = {
  [stateSlice.name]: stateSlice.reducer,
  [navbarSlice.name]: navbarSlice.reducer,
  [tasksSlice.name]: tasksSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
};

const rootReducer = combineReducers<RootSlice>(reducers);

export type StoreState = ReturnType<typeof rootReducer>;

export const store: Store = configureStore({
  reducer: reducers,
  devTools: true,
});

export const store$ = (_store: Store | ProxyStore, getter: (state: StoreState) => any = (state: StoreState) => state) => {
  const _store$ = new BehaviorSubject<RootSlice>(_store.getState());
  const unsubscribe = _store.subscribe(() => _store$.next(_store.getState()));
  return _store$.pipe(map(getter), distinctUntilChanged(), finalize(unsubscribe));
};
