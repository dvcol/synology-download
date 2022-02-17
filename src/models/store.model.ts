import { TaskTab } from './tab.model';
import { Connection, Global, Notifications, Polling } from './settings.model';
import { Task, TaskCount, TaskStatistics } from './task.model';
import { ContextMenu, QuickMenu } from './menu.model';
import { Store } from 'redux';
import { Store as StoreProxy } from 'webext-redux';

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
