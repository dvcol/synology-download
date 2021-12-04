import { TaskTab } from './tab.model';
import { ContextMenuOption } from './context-menu.model';
import { Connection, Polling } from './settings.model';
import { Task, TaskStatus } from './task.model';

export interface ModalSlice {
  popup: boolean;
  option: boolean;
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
  modal: ModalSlice;
  navbar: NavbarSlice;
  tasks: TasksSlice;
  settings: SettingsSlice;
}
