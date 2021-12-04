import { defaultTabs } from './tab.model';
import { defaultMenu } from './context-menu.model';
import { SettingsSlice } from './store.model';

export enum SettingHeader {
  connection = 'connection',
  interface = 'interface',
  notification = 'notification',
}

export interface Connection {
  protocol?: string;
  path?: string;
  port?: number;
  username?: string;
  password?: string;
}

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
  connection: { protocol: 'http' },
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultMenu],
};
