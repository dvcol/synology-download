import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';
import { Connection, ThemeMode } from '@src/models';
import { darkTheme, lightTheme } from '@src/themes';

export const getSettings = createSelector(
  (state: StoreState) => state,
  (state) => state.settings
);

export const getTabs = createSelector(getSettings, (setting) => setting?.tabs);

export const getMenus = createSelector(getSettings, (setting) => setting?.menus);

export const getQuick = createSelector(getSettings, (setting) => setting?.quick);

export const getConnection = createSelector(getSettings, (setting) => setting?.connection);

export const urlReducer = (connection: Connection) => {
  if (connection.protocol && connection.path && connection.port) {
    return new URL(`${connection.protocol}://${connection.path}:${connection.port}`).toString();
  }
  return '';
};

export const getUrl = createSelector(getConnection, urlReducer);

export const getUsername = createSelector(getConnection, (connection) => connection?.username);

export const getPassword = createSelector(getConnection, (connection) => connection?.password);

export const getPolling = createSelector(getSettings, (setting) => setting?.polling);

export const getNotifications = createSelector(getSettings, (setting) => setting?.notifications);

export const getNotificationsCount = createSelector(getNotifications, (notifications) => notifications?.count);

export const getNotificationsSnack = createSelector(getNotifications, (notifications) => notifications?.snack);

export const getNotificationsSnackLevel = createSelector(getNotificationsSnack, (snack) => snack?.level);

export const getNotificationsBanner = createSelector(getNotifications, (notifications) => notifications?.banner);

export const getNotificationsBannerLevel = createSelector(getNotificationsBanner, (banner) => banner?.level);

export const getNotificationsBannerFailedEnabled = createSelector(getNotifications, ({ banner }) => banner?.scope.failed);

export const getNotificationsBannerFinishedEnabled = createSelector(getNotifications, ({ banner }) => banner?.scope.finished);

export const getGlobal = createSelector(getSettings, (setting) => setting?.global);

export const getThemeMode = createSelector(getGlobal, ({ theme }) => {
  switch (theme) {
    case ThemeMode.dark:
      return darkTheme;
    case ThemeMode.light:
      return lightTheme;
    case ThemeMode.auto:
      return null;
  }
});
