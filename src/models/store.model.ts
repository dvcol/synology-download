import { TaskTab } from './tab.model';
import { Connection, Notifications, Polling } from './settings.model';
import { Task, TaskCount, TaskStatus } from './task.model';
import { ContextMenu, QuickMenu } from './menu.model';

export interface StateSlice {
  logged: boolean;
  modal: {
    popup: boolean;
    option: boolean;
  };
}

export interface NavbarSlice {
  tab?: TaskTab;
}

export interface TasksSlice {
  entities: Task[];
  statuses: TaskStatus[];
  count?: TaskCount;
}

export interface SettingsSlice {
  notifications: Notifications;
  connection: Connection;
  polling: Polling;
  tabs: TaskTab[];
  menus: ContextMenu[];
  quick: QuickMenu[];
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  settings: SettingsSlice;
}
