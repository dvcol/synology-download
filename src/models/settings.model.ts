import { OptionsObject } from 'notistack';

import { defaultContextMenu, defaultQuickMenu } from './menu.model';
import { BannerNotificationScope, NotificationLevel, SnackNotificationScope } from './notification.model';
import { SettingsSlice } from './store.model';
import { defaultTabs, Tab, TabType } from './tab.model';
import { TaskStatus } from './task.model';

export enum SettingHeader {
  connection = 'connection',
  interface = 'interface',
  notification = 'notification',
}

export enum NotificationHeader {
  snack = 'snack',
  banner = 'banner',
  count = 'count',
}

export enum ConnectionHeader {
  credential = 'credentials',
  polling = 'polling',
}

export enum InterfaceHeader {
  global = 'global',
  tabs = 'tabs',
  quickMenu = 'quick_menu',
  contextMenu = 'context_menu',
}

export enum ConnectionType {
  local = 'local',
  quickConnect = 'quick_connect', // No functioning API
  twoFactor = 'two_factor',
}

export enum Protocol {
  http = 'http',
  https = 'https',
}

export interface Credentials {
  type?: ConnectionType;
  authVersion?: number;
  username?: string;
  password?: string;
  otp_code?: string;
  enable_device_token?: boolean;
  device_name?: string;
  device_id?: string;
}

export interface Connection extends Credentials {
  rememberMe?: boolean;
  autoLogin?: boolean;
  protocol?: Protocol;
  path?: string;
  port?: number;
}

export const defaultConnection: Connection = {
  type: ConnectionType.local,
  authVersion: 1,
  rememberMe: true,
  autoLogin: true,
  protocol: Protocol.http,
  port: 5000,
};

export interface Polling {
  enabled: boolean;
  // 0 means disabled
  background: { enabled: boolean; interval: number };
  // 0 means disabled
  popup: { enabled: boolean; interval: number };
}

export const defaultPolling: Polling = {
  enabled: true,
  background: { enabled: true, interval: 20000 },
  popup: { enabled: true, interval: 3000 },
};

export interface NotificationsCount extends Tab {
  enabled: boolean;
}

export interface NotificationsBanner {
  enabled: boolean;
  level: NotificationLevel;
  scope: BannerNotificationScope;
}

export interface NotificationsSnack {
  enabled: boolean;
  level: NotificationLevel;
  scope: SnackNotificationScope;
  timeout: OptionsObject['autoHideDuration'];
  position: OptionsObject['anchorOrigin'];
}

export interface Notifications {
  count: NotificationsCount;
  snack: NotificationsSnack;
  banner: NotificationsBanner;
}

export const defaultNotifications: Notifications = {
  count: {
    enabled: true,
    template: TabType.all,
    status: Object.values(TaskStatus),
    destination: { enabled: false },
    color: '#4285f4',
  },
  snack: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      popup: true,
      content: true,
    },
    timeout: 5000,
    position: { vertical: 'bottom', horizontal: 'right' },
  },
  banner: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      background: true,
      popup: true,
      finished: true,
      failed: true,
    },
  },
};

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  auto = 'auto',
}

export enum ActionScope {
  all = 'all',
  tab = 'tab',
}

export interface Global {
  theme: ThemeMode;
  actions: ActionScope;
  loading: { enabled: boolean; threshold: number };
  task: {
    progressBar: boolean;
    background: boolean;
  };
}

export const defaultGlobal = {
  theme: ThemeMode.auto,
  actions: ActionScope.all,
  loading: { enabled: true, threshold: 300 },
  task: {
    progressBar: true,
    background: true,
  },
};

export const defaultSettings: SettingsSlice = {
  notifications: defaultNotifications,
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultContextMenu],
  quick: [defaultQuickMenu],
  global: defaultGlobal,
};
