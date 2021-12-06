import { TaskTab } from './tab.model';
import { ContextMenuOption } from './context-menu.model';
import { Connection, Polling } from './settings.model';
import { Task, TaskStatus } from './task.model';

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
}

export interface SettingsSlice {
  connection: Connection;
  polling: Polling;
  tabs: TaskTab[];
  menus: ContextMenuOption[];
}

export interface RootSlice {
  state: StateSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  settings: SettingsSlice;
}
