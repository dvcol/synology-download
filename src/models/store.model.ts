import type { Download } from './download.model';
import type { ContextMenu, QuickMenu } from './menu.model';
import type { Connection, Global, Notifications, Polling } from './settings.model';
import type { TaskTab } from './tab.model';
import type { Task, TaskCount, TaskStatistics } from './task.model';
import type { Store } from 'redux';
import type { Store as StoreProxy } from 'webext-redux';

export interface StateSlice {
  logged: boolean;
  sid?: string;
  modal: {
    popup: boolean;
    option: boolean;
  };
  loading: number;
}

export interface NavbarSlice {
  tab?: TaskTab;
}

export interface TasksSlice {
  entities: Task[];
  count?: TaskCount;
  stats?: TaskStatistics;
}

export interface DownloadsSlice {
  entities: Download[];
  count?: TaskCount;
}

export const SettingsSliceName = 'settings';

export interface SettingsSlice {
  notifications: Notifications;
  connection: Connection;
  polling: Polling;
  tabs: TaskTab[];
  menus: ContextMenu[];
  quick: QuickMenu[];
  global: Global;
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  downloads: DownloadsSlice;
  settings: SettingsSlice;
}

export type StoreOrProxy = Store | StoreProxy;
