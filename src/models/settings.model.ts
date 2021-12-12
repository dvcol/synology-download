import { defaultTabs, TabType } from './tab.model';
import { defaultMenu } from './context-menu.model';
import { SettingsSlice } from './store.model';
import { TaskStatus } from './task.model';
import { NotificationLevel, NotificationScope } from './notification.model';

export enum SettingHeader {
  connection = 'connection',
  interface = 'interface',
  notification = 'notification',
}

export enum NotificationHeader {
  push = 'push notification',
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

export const defaultConnection: Connection = { rememberMe: false, protocol: 'http', port: 5000 };

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

export interface NotificationsCount {
  enabled: boolean;
  template: TabType;
  status: TaskStatus[];
  color: string;
}

export interface NotificationsBanner {
  enabled: boolean;
  level: NotificationLevel;
  scope: NotificationScope;
}

export interface Notifications {
  count: NotificationsCount;
  banner: NotificationsBanner;
}

export const defaultNotifications: Notifications = {
  count: {
    enabled: true,
    template: TabType.all,
    status: Object.values(TaskStatus),
    color: '#4285f4',
  },
  banner: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      background: true,
      popup: false,
      recap: false,
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
