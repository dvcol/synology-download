import { TaskTab } from './tab.model';
import { ContextMenu } from './context-menu.model';
import { Connection, Notifications, Polling } from './settings.model';
import { Task, TaskStatus } from './task.model';
import { QuickMenu } from './quick-menu.model';

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
  count?: number;
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
