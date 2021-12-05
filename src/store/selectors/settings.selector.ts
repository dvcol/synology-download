import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';

export const getSettings = createSelector(
  (state: StoreState) => state,
  (state) => state.settings
);

export const getTabs = createSelector(getSettings, (setting) => setting?.tabs);

export const getMenus = createSelector(getSettings, (setting) => setting?.menus);

export const getConnection = createSelector(getSettings, (setting) => setting?.connection);

export const getUrl = createSelector(getConnection, (state) => {
  if (state.protocol && state.path && state.port) {
    return new URL(`${state.protocol}://${state.path}:${state.port}`).toString();
  }
  return '';
});

export const getUsername = createSelector(getConnection, (connection) => connection?.username);

export const getPassword = createSelector(getConnection, (connection) => connection?.password);

export const getPolling = createSelector(getSettings, (setting) => setting?.polling);
