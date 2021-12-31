import { defaultTabs, Tab, TabType } from './tab.model';
import { defaultMenu } from './context-menu.model';
import { SettingsSlice } from './store.model';
import { TaskStatus } from './task.model';
import { BannerNotificationScope, NotificationLevel, SnackNotificationScope } from './notification.model';
import { OptionsObject } from 'notistack';

export enum SettingHeader {
  connection = 'connection',
  interface = 'interface',
  notification = 'notification',
}

export enum NotificationHeader {
  banner = 'banners',
  count = 'tasks count',
}

export enum ConnectionHeader {
  credential = 'credentials',
  polling = 'polling',
}

export enum InterfaceHeader {
  modals = 'modals',
  tabs = 'tabs',
  context = 'context',
}

export interface Connection {
  rememberMe?: boolean;
  protocol?: string;
  path?: string;
  port?: number;
  username?: string;
  password?: string;
}

export const defaultConnection: Connection = { rememberMe: true, protocol: 'http', port: 5000 };

export interface Polling {
  enabled: boolean;
  // 0 means disabled
  background: { enabled: boolean; interval: number };
  // 0 means disabled
  popup: { enabled: boolean; interval: number };
}

export const defaultPolling: Polling = {
  enabled: true,
  background: { enabled: true, interval: 60000 },
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
    color: '#4285f4',
  },
  snack: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      popup: true,
      content: true,
    },
    timeout: 3000,
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

export const defaultSettings: SettingsSlice = {
  notifications: defaultNotifications,
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultMenu],
};
