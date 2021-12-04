import { ReducersMapObject, Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { modalSlice, navbarSlice, settingsSlice, tasksSlice } from './slices';
import { RootSlice } from '../models';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

export const proxyStore = new ProxyStore();

const reducers: ReducersMapObject<RootSlice> = {
  [modalSlice.name]: modalSlice.reducer,
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
  store.subscribe(() => _store$.next(_store.getState()));
  return _store$.pipe(map(getter), distinctUntilChanged());
};
