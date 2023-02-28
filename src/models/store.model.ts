import type { ContentCount } from '@src/models/content.model';

import type { Download } from './download.model';

import type { ContextMenu, QuickMenu } from './menu.model';
import type { Connection, Downloads, Global, Notifications, Polling } from './settings.model';
import type { ContentTab } from './tab.model';
import type { Task, TaskStatistics } from './task.model';
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
  badge: { count?: ContentCount; stats?: TaskStatistics };
}

export interface NavbarSlice {
  tab?: ContentTab;
}

export interface TasksSlice {
  entities: Task[];
  stats?: TaskStatistics;
}

export interface DownloadsSlice {
  entities: Download[];
}

export const SettingsSliceName = 'settings';

export interface SettingsSlice {
  notifications: Notifications;
  connection: Connection;
  polling: Polling;
  tabs: ContentTab[];
  menus: ContextMenu[];
  quick: QuickMenu[];
  global: Global;
  downloads: Downloads;
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  downloads: DownloadsSlice;
  settings: SettingsSlice;
}

export type StoreOrProxy = Store | StoreProxy;
