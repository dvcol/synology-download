import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';

import { configureStore } from '@reduxjs/toolkit';
import { navbarSlice, settingsSlice, tasksSlice } from './slices';

export const proxyStore = new ProxyStore();

export const store: Store = configureStore({
  reducer: {
    navbar: navbarSlice.reducer,
    settings: settingsSlice.reducer,
    tasks: tasksSlice.reducer,
  },
  devTools: true,
});
