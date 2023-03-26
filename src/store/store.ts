// eslint-disable-next-line import/no-extraneous-dependencies -- only added in dev mode
import { devToolsEnhancer } from '@redux-devtools/remote';
import { combineReducers, configureStore } from '@reduxjs/toolkit';

import type { RootSlice } from '@src/models';

import { LoggerService } from '@src/services';

import { scrapedSlice } from '@src/store/slices/scraped.slice';

import { downloadsSlice } from './slices/downloads.slice';
import { navbarSlice } from './slices/navbar.slice';
import { settingsSlice } from './slices/settings.slice';
import { stateSlice } from './slices/state.slice';
import { tasksSlice } from './slices/tasks.slice';

import type { ConfigureStoreOptions } from '@reduxjs/toolkit/src/configureStore';

import type { ReducersMapObject, Store } from 'redux';

const reducers: ReducersMapObject<RootSlice> = {
  [stateSlice.name]: stateSlice.reducer,
  [navbarSlice.name]: navbarSlice.reducer,
  [tasksSlice.name]: tasksSlice.reducer,
  [downloadsSlice.name]: downloadsSlice.reducer,
  [scrapedSlice.name]: scrapedSlice.reducer,
  [settingsSlice.name]: settingsSlice.reducer,
};

const rootReducer = combineReducers<RootSlice>(reducers);

export type StoreState = ReturnType<typeof rootReducer>;

const options: ConfigureStoreOptions<RootSlice> = { reducer: reducers, devTools: { name: 'synology-download' } };

if (process.env.NODE_ENV === 'development' || process.env.DEVTOOL === 'true') {
  const context = global?.document?.querySelector<HTMLDivElement>("[id^='synology-download-']")?.dataset?.context;
  if (!global?.document || context === 'popup') {
    const name = `synology-download-remote-${context ?? 'background'}`;
    const devtools = { realtime: true, hostname: 'localhost', port: 8000, name };
    options.enhancers = [devToolsEnhancer(devtools)];
    LoggerService.debug('Redux devtool exposed on', `http://${devtools.hostname}:${devtools.port}`, name);
  }
}
export const store: Store = configureStore(options);
