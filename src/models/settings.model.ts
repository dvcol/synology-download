import { NavbarButtonType } from '@src/models/navbar.model';

import { defaultContextMenu, defaultQuickMenu } from './menu.model';

import { NotificationLevel } from './notification.model';

import { defaultTabs, TabType } from './tab.model';

import { TaskStatus } from './task.model';

import type { BannerNotificationScope, SnackNotificationScope } from './notification.model';
import type { SettingsSlice } from './store.model';
import type { Tab } from './tab.model';

import type { OptionsObject } from 'notistack';

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
  downloads = 'downloads',
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

export const defaultCredentials: Credentials = {
  username: 'admin',
};

export interface Connection extends Credentials {
  rememberMe?: boolean;
  autoLogin?: boolean;
  protocol?: Protocol;
  path?: string;
  port?: number;
}

export const defaultConnection: Connection = {
  ...defaultCredentials,
  type: ConnectionType.local,
  authVersion: 1,
  rememberMe: true,
  autoLogin: true,
  protocol: Protocol.http,
  path: 'diskstation',
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

export enum InterfaceSize {
  small = 0.8,
  normal = 1,
  large = 1.2,
}

export interface Global {
  theme: ThemeMode;
  actions: ActionScope;
  loading: { enabled: boolean; threshold: number };
  task: {
    progressBar: boolean;
    background: boolean;
  };
  download: {
    progressBar: boolean;
    background: boolean;
  };
  navbar: { buttons: NavbarButtonType[] };
  interface: {
    size: InterfaceSize | number;
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
  download: {
    progressBar: true,
    background: true,
  },
  navbar: { buttons: [NavbarButtonType.Refresh, NavbarButtonType.Clear] },
  interface: {
    size: InterfaceSize.normal,
  },
};

export interface Downloads {
  enabled: boolean;
}

export const defaultDownloads = {
  enabled: true,
};

export const defaultSettings: SettingsSlice = {
  notifications: defaultNotifications,
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultContextMenu],
  quick: [defaultQuickMenu],
  global: defaultGlobal,
  downloads: defaultDownloads,
};
