import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';

export const getSettings = createSelector(
  (state: StoreState) => state,
  (state) => state.settings
);

export const getTabs = createSelector(getSettings, (state) => state.tabs);

export const getConnection = createSelector(
  (state: StoreState) => state,
  (state) => state.settings.connection
);

export const getUrl = createSelector(getConnection, (state) => {
  if (state.protocol && state.path && state.port) {
    return new URL(`${state.protocol}://${state.path}:${state.port}`).toString();
  }
  return '';
});

export const getUsername = createSelector(
  (state: StoreState) => state,
  (state) => state.settings.connection.username
);

export const getPassword = createSelector(
  (state: StoreState) => state,
  (state) => state.settings.connection.password
);

export const getPolling = createSelector(
  (state: StoreState) => state,
  (state) => state.settings?.polling
);
