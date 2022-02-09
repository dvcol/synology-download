import { TaskTab } from './tab.model';
import { Connection, Global, Notifications, Polling } from './settings.model';
import { Task, TaskCount } from './task.model';
import { ContextMenu, QuickMenu } from './menu.model';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';

export interface StateSlice {
  logged: boolean;
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

export type StoreOrProxy = Store | ProxyStore;
