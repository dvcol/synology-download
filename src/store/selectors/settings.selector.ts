import type { Theme } from '@mui/material';

import type { AdvancedLogging, AdvancedSettings, ConnectionSettings, ContentSettings, Credentials, DownloadSettings, DownloadsIntercept, GlobalSettings, NotificationsBanner, NotificationSettings, NotificationsSnack, PollingSettings, ScrapeSettings, SettingsSlice, SyncSettings, TaskSettings } from '@src/models';

import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';

import { ConnectionType, defaultAdvancedSettings, defaultConnection, defaultContentSettings, defaultDownloads, defaultGlobal, defaultLoggingLevels, defaultNotifications, defaultPolling, defaultScrapeSettings, defaultSyncSettings, defaultTaskSettings, TaskStatus, ThemeMode } from '@src/models';
import { LoggerService } from '@src/services';
import { darkTheme, lightTheme } from '@src/themes';

export const getSettings: (state: StoreState) => SettingsSlice = createSelector(
  (state: StoreState) => state,
  state => state.settings,
);

export const getTabs: (state: StoreState) => SettingsSlice['tabs'] = createSelector(getSettings, (setting: SettingsSlice) => setting?.tabs);

const taskStatuses = Object.values(TaskStatus).map(String);
export const getActiveTabs: (state: StoreState) => SettingsSlice['tabs'] = createSelector(getSettings, (setting: SettingsSlice) => {
  if (!setting.downloads.enabled) {
    return setting?.tabs?.filter(tab => tab.status?.some(s => taskStatuses.includes(s)));
  }

  return setting?.tabs;
});

export const getMenus: (state: StoreState) => SettingsSlice['menus'] = createSelector(getSettings, (setting: SettingsSlice) => setting?.menus ?? []);

export const getQuick: (state: StoreState) => SettingsSlice['quick'] = createSelector(getSettings, (setting: SettingsSlice) => setting?.quick ?? []);

export const getConnection: (state: StoreState) => ConnectionSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.connection ?? defaultConnection);

/**
 * Returns true if we should attempt an auto-login
 * @param connection the connection slice
 */
function shouldAutoLogin(connection: ConnectionSettings) {
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
}

export const getShouldAutoLogin: (state: StoreState) => boolean = createSelector(getConnection, shouldAutoLogin);

export function urlReducer(connection: ConnectionSettings) {
  const { type, protocol, path, port } = connection;
  if (ConnectionType.custom === type && path) return new URL(path).toString();
  if (ConnectionType.quickConnect === type && protocol && path) return new URL(`${protocol}://${path}.quickconnect.to`).toString();
  if (protocol && path && port) return new URL(`${protocol}://${path}:${port}`).toString();
  return '';
}

export const getUrl: (state: StoreState) => string = createSelector(getConnection, urlReducer);

export const getCredentials: (state: StoreState) => Credentials = createSelector(
  getConnection,
  ({ rememberMe, protocol, path, port, ...credentials }: ConnectionSettings) => credentials as Credentials,
);

export const getType: (state: StoreState) => ConnectionSettings['type'] = createSelector(getConnection, (connection: ConnectionSettings) => connection?.type);

export const getPolling: (state: StoreState) => PollingSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.polling ?? defaultPolling);

export const getNotifications: (state: StoreState) => NotificationSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.notifications ?? defaultNotifications);

export const getNotificationsCount: (state: StoreState) => NotificationSettings['count'] = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.count ?? defaultNotifications.count);

export const getNotificationsSnack: (state: StoreState) => NotificationsSnack = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.snack ?? defaultNotifications.snack);

export const getNotificationsSnackLevel: (state: StoreState) => NotificationsSnack['level'] = createSelector(getNotificationsSnack, (snack: NotificationsSnack) => snack?.level ?? defaultNotifications.snack.level);

export const getNotificationsBanner: (state: StoreState) => NotificationsBanner = createSelector(getNotifications, (notifications: NotificationSettings) => notifications?.banner ?? defaultNotifications.banner);

export const getNotificationsBannerLevel: (state: StoreState) => NotificationsBanner['level'] = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.level ?? defaultNotifications.banner.level);

export const getNotificationsBannerFailedEnabled: (state: StoreState) => boolean = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.scope?.failed ?? defaultNotifications.banner.scope.failed);

export const getNotificationsBannerFinishedEnabled: (state: StoreState) => boolean = createSelector(getNotificationsBanner, (banner: NotificationsBanner) => banner?.scope?.finished ?? defaultNotifications.banner.scope.finished);

export const getScrapeSettings: (state: StoreState) => ScrapeSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.scrape ?? defaultScrapeSettings);

export const getContentSettings: (state: StoreState) => ContentSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.content ?? defaultContentSettings);

export const getGlobal: (state: StoreState) => GlobalSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.global ?? defaultGlobal);

export const getGlobalLoading: (state: StoreState) => GlobalSettings['loading'] = createSelector(getGlobal, (_global: GlobalSettings) => _global?.loading ?? defaultGlobal.loading);

export const getActionScope: (state: StoreState) => GlobalSettings['actions'] = createSelector(getGlobal, (_global: GlobalSettings) => _global?.actions ?? defaultGlobal.actions);

export const getThemeMode: (state: StoreState) => ThemeMode = createSelector(getGlobal, (_global: GlobalSettings) => _global?.theme ?? defaultGlobal.theme);

export const getTheme: (state: StoreState) => Theme | null = createSelector(getThemeMode, (theme: ThemeMode) => {
  switch (theme) {
    case ThemeMode.dark:
      return darkTheme;
    case ThemeMode.light:
      return lightTheme;
    case ThemeMode.auto:
      return null;
    default:
      LoggerService.warn(`Theme '${theme as string}' not supported, falling back to ${ThemeMode.auto}`);
      return null;
  }
});

export const getGlobalTask: (state: StoreState) => GlobalSettings['task'] = createSelector(getGlobal, (_global: GlobalSettings) => _global?.task ?? defaultGlobal.task);

export const getGlobalDownload: (state: StoreState) => GlobalSettings['download'] = createSelector(getGlobal, (_global: GlobalSettings) => _global?.download ?? defaultGlobal.download);
export const getGlobalNavbarButton: (state: StoreState) => GlobalSettings['navbar']['buttons'] = createSelector(
  getGlobal,
  (_global: GlobalSettings) => _global?.navbar?.buttons ?? defaultGlobal.navbar?.buttons,
);

export const getInterface: (state: StoreState) => GlobalSettings['interface'] = createSelector(getGlobal, (_global: GlobalSettings) => _global?.interface ?? defaultGlobal.interface);

export const getInterfaceSize: (state: StoreState) => GlobalSettings['interface']['size'] = createSelector(
  getInterface,
  (_interface: GlobalSettings['interface']) => _interface?.size ?? defaultGlobal.interface?.size,
);

export const getInterfacePullToRefresh: (state: StoreState) => boolean = createSelector(
  getInterface,
  (_interface: GlobalSettings['interface']) => _interface?.pullToRefresh ?? defaultGlobal.interface.pullToRefresh,
);

export const getSettingsDownloads: (state: StoreState) => DownloadSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.downloads ?? defaultDownloads);

export const getSettingsDownloadsEnabled: (state: StoreState) => boolean = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.enabled ?? defaultDownloads.enabled,
);

export const getSettingsDownloadsButtons: (state: StoreState) => DownloadSettings['buttons'] | false = createSelector(
  getSettingsDownloads,
  getSettingsDownloadsEnabled,
  (downloads: DownloadSettings, enabled: boolean) => enabled && (downloads.buttons ?? defaultDownloads.buttons),
);
export const getSettingsDownloadsNotifications: (state: StoreState) => DownloadSettings['notifications'] | false = createSelector(
  getSettingsDownloads,
  getSettingsDownloadsEnabled,
  (downloads: DownloadSettings, enabled: boolean) => enabled && (downloads.notifications ?? defaultDownloads.notifications),
);
export const getSettingsDownloadsTransfer: (state: StoreState) => DownloadSettings['transfer'] = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.transfer ?? defaultDownloads.transfer,
);

export const getSettingsDownloadsIntercept: (state: StoreState) => DownloadsIntercept = createSelector(
  getSettingsDownloads,
  (downloads: DownloadSettings) => downloads.intercept ?? defaultDownloads.intercept,
);

export const getSettingsDownloadsInterceptEnabled: (state: StoreState) => boolean = createSelector(
  getSettingsDownloadsIntercept,
  getSettingsDownloadsEnabled,
  (intercept: DownloadsIntercept, enabled) => enabled && intercept?.enabled,
);

export const getAdvancedSettings: (state: StoreState) => AdvancedSettings = createSelector(getSettings, (settings: SettingsSlice) => settings?.advanced ?? defaultAdvancedSettings);

export const getAdvancedSettingsLogging: (state: StoreState) => AdvancedLogging = createSelector(
  getAdvancedSettings,
  (settings: AdvancedSettings) => settings?.logging ?? defaultAdvancedSettings.logging,
);

export const getAdvancedSettingsLoggingEnabled: (state: StoreState) => boolean = createSelector(
  getAdvancedSettingsLogging,
  (logging: AdvancedLogging) => logging?.enabled ?? defaultAdvancedSettings.logging?.enabled ?? false,
);

export const getAdvancedSettingsLoggingLevel: (state: StoreState) => AdvancedLogging['levels'] = createSelector(
  getAdvancedSettingsLogging,
  (logging: AdvancedLogging) => logging?.levels ?? defaultLoggingLevels,
);

export const getSyncSettings: (state: StoreState) => SyncSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.sync ?? defaultSyncSettings);

export const getTaskSettings: (state: StoreState) => TaskSettings = createSelector(getSettings, (setting: SettingsSlice) => setting?.tasks ?? defaultTaskSettings);

export const getClearOnExitTaskSettings: (state: StoreState) => TaskSettings['clearOnExist'] = createSelector(getTaskSettings, (setting: TaskSettings) => setting.clearOnExist);
