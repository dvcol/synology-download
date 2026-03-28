import type { ReducersMapObject, Store } from 'redux';

import type { RootSlice } from '../models/store.model';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { downloadsSlice } from './slices/downloads.slice';
import { navbarSlice } from './slices/navbar.slice';
import { scrapedSlice } from './slices/scraped.slice';
import { settingsSlice } from './slices/settings.slice';
import { stateSlice } from './slices/state.slice';
import { tasksSlice } from './slices/tasks.slice';

const reducers: ReducersMapObject<RootSlice> = {
  [stateSlice.name]: stateSlice.reducer,
  [navbarSlice.name]: navbarSlice.reducer,
  [tasksSlice.name]: tasksSlice.reducer,
  [downloadsSlice.name]: downloadsSlice.reducer,
  [scrapedSlice.name]: scrapedSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
};

export const rootReducer = combineReducers<RootSlice>(reducers);

export type StoreState = ReturnType<typeof rootReducer>;

export const store: Store<RootSlice> = configureStore({ reducer: reducers, devTools: false });
