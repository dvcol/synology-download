import type { ContentCount } from '@src/models/content.model';

import type { ScrapedContents, ScrapedPage } from '@src/models/scraped-content.model';

import type { Download } from './download.model';

import type { ContextMenu, QuickMenu } from './menu.model';
import type { AdvancedSettings, Connection, Downloads, Global, Log, Notifications, Polling, SyncSettings } from './settings.model';
import type { ContentTab } from './tab.model';
import type { Task, TaskComplete, TaskFile, TaskStatistics } from './task.model';
import type { Store } from 'redux';
import type { Store as StoreProxy } from 'webext-redux';

export interface StateSlice {
  logged: boolean;
  sid?: string;
  modal: {
    popup: boolean;
    option: boolean;
  };
  content: {
    menu: boolean;
    dialog: boolean;
  };
  loading: number;
  badge: { count?: ContentCount; stats?: TaskStatistics };
  history: {
    destinations: string[];
    folders: string[];
    logs: Log[];
  };
  download: {
    enabled: boolean;
    defaultFolder?: string;
  };
}

export interface NavbarSlice {
  tab?: ContentTab;
}

export interface TasksSlice {
  stopping: Record<string, TaskComplete>;
  tasks: Record<string, Task>;
  tasksIds: string[];
  files: Record<string, TaskFile[]>;
  filesIds: Record<string, string[]>;
  stats?: TaskStatistics;
}

export type SyncedTaskSlice = Pick<TasksSlice, 'tasks' | 'tasksIds'>;

export interface DownloadsSlice {
  entities: Download[];
}

export interface ScrapedSlice {
  page: ScrapedPage;
  contents: ScrapedContents;
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
  advanced: AdvancedSettings;
  sync: SyncSettings;
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  downloads: DownloadsSlice;
  scraped: ScrapedSlice;
  settings: SettingsSlice;
}

export type StoreOrProxy = Store | StoreProxy;

export const StorePortName = 'synology-download-proxy-store';
