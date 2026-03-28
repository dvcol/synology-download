import type { Store, UnknownAction } from 'redux';

import type { ContentCount } from './content.model';
import type { Download } from './download.model';
import type { ContextMenu, QuickMenu } from './menu.model';
import type { ScrapedContents, ScrapedPage } from './scraped-content.model';
import type { AdvancedSettings, ConnectionSettings, ContentSettings, DownloadSettings, GlobalSettings, Log, NotificationSettings, PollingSettings, ScrapeSettings, SyncSettings, TaskSettings } from './settings.model';
import type { InfoResponse } from './synology.model';
import type { ContentTab } from './tab.model';
import type { Task, TaskComplete, TaskFile, TaskForm, TaskStatistics } from './task.model';

export interface StateSlice {
  logged: boolean;
  sid?: string;
  modal: {
    popup: boolean;
    panel: boolean;
    option: boolean;
    standalone: boolean;
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
  api: InfoResponse;
}

export interface NavbarSlice {
  tab?: ContentTab;
}

export interface TasksSlice {
  taskForm: TaskForm;
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
  notifications: NotificationSettings;
  connection: ConnectionSettings;
  polling: PollingSettings;
  tabs: ContentTab[];
  menus: ContextMenu[];
  quick: QuickMenu[];
  global: GlobalSettings;
  tasks: TaskSettings;
  downloads: DownloadSettings;
  advanced: AdvancedSettings;
  sync: SyncSettings;
  scrape: ScrapeSettings;
  content: ContentSettings;
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  downloads: DownloadsSlice;
  scraped: ScrapedSlice;
  settings: SettingsSlice;
}

/**
 * Unified store type that is compatible with both Redux Store and webext-redux Store.
 * This resolves the dispatch signature incompatibility between the two store types.
 */
export interface StoreOrProxy<Root = RootSlice> extends Omit<Store<Root>, 'dispatch'> {
  dispatch: (action: UnknownAction) => unknown;
  ready?: () => Promise<void>;
  replaceState?: (state: Root) => void;
  patchState?: (difference: unknown[]) => void;
}

export const StorePortName = 'synology-download-proxy-store';
