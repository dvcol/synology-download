import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { BehaviorSubject, distinctUntilChanged, finalize, map } from 'rxjs';

import type { RootSlice, StoreOrProxy } from '@src/models';

import { downloadsSlice } from './slices/downloads.slice';
import { navbarSlice } from './slices/navbar.slice';
import { settingsSlice } from './slices/settings.slice';
import { stateSlice } from './slices/state.slice';
import { tasksSlice } from './slices/tasks.slice';

import type { ReducersMapObject, Store } from 'redux';

const reducers: ReducersMapObject<RootSlice> = {
  [stateSlice.name]: stateSlice.reducer,
  [navbarSlice.name]: navbarSlice.reducer,
  [tasksSlice.name]: tasksSlice.reducer,
  [downloadsSlice.name]: downloadsSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
};

const rootReducer = combineReducers<RootSlice>(reducers);

export type StoreState = ReturnType<typeof rootReducer>;

export const store: Store = configureStore({
  reducer: reducers,
  devTools: true,
});

export const store$ = (_store: StoreOrProxy, getter: (state: StoreState) => any = (state: StoreState) => state) => {
  const _store$ = new BehaviorSubject<RootSlice>(_store.getState());
  const unsubscribe = _store.subscribe(() => _store$.next(_store.getState()));
  return _store$.pipe(map(getter), distinctUntilChanged(), finalize(unsubscribe));
};
