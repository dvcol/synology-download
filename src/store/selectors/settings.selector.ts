import { createSelector } from '@reduxjs/toolkit';

import type {
  AdvancedLogging,
  AdvancedSettings,
  ConnectionSettings,
  Credentials,
  DownloadSettings,
  DownloadsIntercept,
  GlobalSettings,
  NotificationsBanner,
  NotificationSettings,
  NotificationsSnack,
  SettingsSlice,
  TaskSettings,
} from '@src/models';
import {
  ConnectionType,
  defaultAdvancedSettings,
  defaultConnection,
  defaultContentSettings,
  defaultDownloads,
  defaultGlobal,
  defaultLoggingLevels,
  defaultScrapeSettings,
  defaultTaskSettings,
  TaskStatus,
  ThemeMode,
} from '@src/models';
import { LoggerService } from '@src/services';
import { darkTheme, lightTheme } from '@src/themes';

import type { StoreState } from '../store';

export const getSettings = createSelector(
  (state: StoreState) => state,
  state => state.settings,
);

export const getTabs = createSelector(getSettings, (setting: SettingsSlice) => setting?.tabs);

const taskStatuses = Object.values(TaskStatus).map(String);
export const getActiveTabs = createSelector(getSettings, (setting: SettingsSlice) => {
  if (!setting.downloads.enabled) {
    return setting?.tabs?.filter(tab => tab.status?.some(s => taskStatuses.includes(s)));
  }

  return setting?.tabs;
});

export const getMenus = createSelector(getSettings, (setting: SettingsSlice) => setting?.menus);

export const getQuick = createSelector(getSettings, (setting: SettingsSlice) => setting?.quick);

export const getConnection = createSelector(getSettings, (setting: SettingsSlice) => setting?.connection ?? defaultConnection);

/**
 * Returns true if we should attempt an auto-login
 * @param connection the connection slice
 */
const shouldAutoLogin = (connection: ConnectionSettings) => {
  // If missing username
  if (!connection?.username) return false;
  // If missing password
  if (!connection?.password) return false;
  // If remember me is not enabled
  if (!connection?.rememberMe) return false;
  // If no auto-login and no previous logged state
  if (!connection?.autoLogin) return false;
  // If 2FA but no device token enabled
  if (connection?.type === ConnectionType.twoFactor && !connection?.enable_device_token) return false;
  // If device token for 2FA but no device id saved
  return !(connection?.type === ConnectionType.twoFactor && !connection?.device_id);
};

export const getShouldAutoLogin = createSelector(getConnection, shouldAutoLogin);

export const urlReducer = (connection: ConnectionSettings) => {
  const { type, protocol, path, port } = connection;
  if (ConnectionType.custom === type && path) return new URL(path).toString();
  if (ConnectionType.quickConnect === type && protocol && path) return new URL(`${protocol}://${path}.quickconnect.to`).toString();
  if (protocol && path && port) return new URL(`${protocol}://${path}:${port}`).toString();
  return '';
};

export const getUrl = createSelector(getConnection, urlReducer);

export const getCredentials = createSelector(
  getConnection,
  ({ rememberMe, protocol, path, port, ...credentials }: ConnectionSettings) => credentials as Credentials,
);

export const getType = createSelector(getConnection, (connection: ConnectionSettings) => connection?.type);

export const getPolling = createSelector(getSettings, (setting: SettingsSlice) => setting?.polling);

export const getNotifications = createSelector(getSettings, (setting: SettingsSlice) => setting?.notifications);

export const getNotificationsCount = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.count);

export const getNotificationsSnack = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.snack);

export const getNotificationsSnackLevel = createSelector(getNotificationsSnack, (snack: NotificationsSnack) => snack?.level);

export const getNotificationsBanner = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.banner);

export const getNotificationsBannerLevel = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.level);

export const getNotificationsBannerFailedEnabled = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.scope.failed);

export const getNotificationsBannerFinishedEnabled = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.scope.finished);

export const getScrapeSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.scrape ?? defaultScrapeSettings);

export const getContentSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.content ?? defaultContentSettings);

export const getGlobal = createSelector(getSettings, (setting: SettingsSlice) => setting?.global);

export const getGlobalLoading = createSelector(getGlobal, (_global: GlobalSettings) => _global?.loading);

export const getActionScope = createSelector(getGlobal, (_global: GlobalSettings) => _global?.actions);

export const getThemeMode = createSelector(getGlobal, (_global: GlobalSettings) => _global?.theme);

export const getTheme = createSelector(getThemeMode, (theme: ThemeMode) => {
  switch (theme) {
    case ThemeMode.dark:
      return darkTheme;
    case ThemeMode.light:
      return lightTheme;
    case ThemeMode.auto:
      return null;
    default:
      LoggerService.warn(`Theme '${theme}' not supported, falling back to ${ThemeMode.auto}`);
      return null;
  }
});

export const getGlobalTask = createSelector(getGlobal, (_global: GlobalSettings) => _global?.task ?? defaultGlobal.task);

export const getGlobalDownload = createSelector(getGlobal, (_global: GlobalSettings) => _global?.download ?? defaultGlobal.download);
export const getGlobalNavbarButton = createSelector(
  getGlobal,
  (_global: GlobalSettings) => _global?.navbar?.buttons ?? defaultGlobal.navbar?.buttons,
);

export const getInterface = createSelector(getGlobal, (_global: GlobalSettings) => _global?.interface);

export const getInterfaceSize = createSelector(
  getInterface,
  (_interface: GlobalSettings['interface']) => _interface?.size ?? defaultGlobal.interface?.size,
);

export const getInterfacePullToRefresh = createSelector(
  getInterface,
  (_interface: GlobalSettings['interface']) => _interface?.pullToRefresh ?? defaultGlobal.interface.pullToRefresh,
);

export const getSettingsDownloads = createSelector(getSettings, (setting: SettingsSlice) => setting?.downloads ?? defaultDownloads);

export const getSettingsDownloadsEnabled = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.enabled ?? defaultDownloads.enabled,
);

export const getSettingsDownloadsButtons = createSelector(
  getSettingsDownloads,
  getSettingsDownloadsEnabled,
  (downloads: DownloadSettings, enabled: boolean) => enabled && (downloads.buttons ?? defaultDownloads.buttons),
);
export const getSettingsDownloadsNotifications = createSelector(
  getSettingsDownloads,
  getSettingsDownloadsEnabled,
  (downloads: DownloadSettings, enabled: boolean) => enabled && (downloads.notifications ?? defaultDownloads.notifications),
);
export const getSettingsDownloadsTransfer = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.transfer ?? defaultDownloads.transfer,
);

export const getSettingsDownloadsIntercept = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.intercept ?? defaultDownloads.intercept,
);

export const getSettingsDownloadsInterceptEnabled = createSelector(
  getSettingsDownloadsIntercept,
  getSettingsDownloadsEnabled,
  (intercept: DownloadsIntercept, enabled) => enabled && intercept?.enabled,
);

export const getAdvancedSettings = createSelector(getSettings, (settings: SettingsSlice) => settings?.advanced ?? defaultAdvancedSettings);

export const getAdvancedSettingsLogging = createSelector(
  getAdvancedSettings,
  (settings: AdvancedSettings) => settings?.logging ?? defaultAdvancedSettings.logging,
);

export const getAdvancedSettingsLoggingEnabled = createSelector(
  getAdvancedSettingsLogging,
  (logging: AdvancedLogging) => logging?.enabled ?? defaultAdvancedSettings.logging?.enabled,
);

export const getAdvancedSettingsLoggingLevel = createSelector(
  getAdvancedSettingsLogging,
  (logging: AdvancedLogging) => logging?.levels ?? defaultLoggingLevels,
);

export const getSyncSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.sync);

export const getTaskSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.tasks ?? defaultTaskSettings);

export const getClearOnExitTaskSettings = createSelector(getTaskSettings, (setting: TaskSettings) => setting.clearOnExist);
