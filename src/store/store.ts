import type { RootSlice } from '../models/store.model';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { downloadsSlice } from './slices/downloads.slice';
import { navbarSlice } from './slices/navbar.slice';
import { scrapedSlice } from './slices/scraped.slice';
import { settingsSlice } from './slices/settings.slice';
import { stateSlice } from './slices/state.slice';
import { tasksSlice } from './slices/tasks.slice';

const reducers = {
  [stateSlice.name]: stateSlice.reducer,
  [navbarSlice.name]: navbarSlice.reducer,
  [tasksSlice.name]: tasksSlice.reducer,
  [downloadsSlice.name]: downloadsSlice.reducer,
  [scrapedSlice.name]: scrapedSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
} satisfies Record<keyof RootSlice, unknown>;

export const rootReducer = combineReducers(reducers);

export type StoreState = ReturnType<typeof rootReducer>;

export const store = configureStore({ reducer: reducers, devTools: false });
