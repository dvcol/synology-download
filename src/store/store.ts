import { Store } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { navbarSlice, settingsSlice, tasksSlice } from './slices';

export const store: Store = configureStore({
  reducer: {
    navbar: navbarSlice.reducer,
    settings: settingsSlice.reducer,
    tasks: tasksSlice.reducer,
  },
  devTools: true,
});
