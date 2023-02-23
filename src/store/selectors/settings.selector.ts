import { createSelector } from '@reduxjs/toolkit';

import type { Connection, Credentials } from '@src/models';
import { ConnectionType, defaultGlobal, ThemeMode } from '@src/models';
import { darkTheme, lightTheme } from '@src/themes';

import type { StoreState } from '../store';

export const getSettings = createSelector(
  (state: StoreState) => state,
  state => state.settings,
);

export const getTabs = createSelector(getSettings, setting => setting?.tabs);

export const getMenus = createSelector(getSettings, setting => setting?.menus);

export const getQuick = createSelector(getSettings, setting => setting?.quick);

export const getConnection = createSelector(getSettings, setting => setting?.connection);

export const urlReducer = (connection: Connection) => {
  if (connection?.protocol && connection?.path && connection?.port) {
    const { type, protocol, path, port } = connection;
    if (ConnectionType.quickConnect === type) return new URL(`${protocol}://${path}.quickconnect.to`).toString();
    return new URL(`${protocol}://${path}:${port}`).toString();
  }
  return '';
};

export const getUrl = createSelector(getConnection, urlReducer);

export const getCredentials = createSelector(getConnection, ({ rememberMe, protocol, path, port, ...credentials }) => credentials as Credentials);

export const getType = createSelector(getConnection, connection => connection?.type);

export const getPolling = createSelector(getSettings, setting => setting?.polling);

export const getNotifications = createSelector(getSettings, setting => setting?.notifications);

export const getNotificationsCount = createSelector(getNotifications, notifications => notifications?.count);

export const getNotificationsSnack = createSelector(getNotifications, notifications => notifications?.snack);

export const getNotificationsSnackLevel = createSelector(getNotificationsSnack, snack => snack?.level);

export const getNotificationsBanner = createSelector(getNotifications, notifications => notifications?.banner);

export const getNotificationsBannerLevel = createSelector(getNotificationsBanner, banner => banner?.level);

export const getNotificationsBannerFailedEnabled = createSelector(getNotifications, ({ banner }) => banner?.scope.failed);

export const getNotificationsBannerFinishedEnabled = createSelector(getNotifications, ({ banner }) => banner?.scope.finished);

export const getGlobal = createSelector(getSettings, setting => setting?.global);

export const getGlobalLoading = createSelector(getGlobal, _global => _global?.loading);

export const getActionScope = createSelector(getGlobal, _global => _global?.actions);

export const getThemeMode = createSelector(getGlobal, _global => {
  switch (_global?.theme) {
    case ThemeMode.dark:
      return darkTheme;
    case ThemeMode.light:
      return lightTheme;
    case ThemeMode.auto:
      return null;
    default:
      console.error(`Theme ${_global?.theme} not supported`);
  }
});

export const getGlobalTask = createSelector(getGlobal, _global => _global?.task ?? defaultGlobal.task);

export const getGlobalNavbarButton = createSelector(getGlobal, _global => _global?.navbar?.buttons ?? defaultGlobal.navbar?.buttons);

export const getInterface = createSelector(getGlobal, _global => _global?.interface);

export const getInterfaceSize = createSelector(getInterface, _interface => _interface?.size ?? defaultGlobal.interface?.size);
