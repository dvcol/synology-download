import { Store } from 'redux';

import { Store as StoreProxy } from 'webext-redux';

import { ContextMenu, QuickMenu } from './menu.model';
import { Connection, Global, Notifications, Polling } from './settings.model';
import { TaskTab } from './tab.model';
import { Task, TaskCount, TaskStatistics } from './task.model';

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
  settings: SettingsSlice;
}

export type StoreOrProxy = Store | StoreProxy;
