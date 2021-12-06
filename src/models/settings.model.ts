import { defaultTabs } from './tab.model';
import { defaultMenu } from './context-menu.model';
import { SettingsSlice } from './store.model';

export enum SettingHeader {
  connection = 'connection',
  interface = 'interface',
  notification = 'notification',
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
  background: number;
  // 0 means disabled
  popup: number;
}

export const defaultPolling: Polling = {
  enabled: false,
  background: 60000,
  popup: 3000,
};

export const defaultSettings: SettingsSlice = {
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultMenu],
};
