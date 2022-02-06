import { ColorLevel } from './material-ui.model';
import { TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';

export interface Tab {
  template: TabType;
  status: TaskStatus[];
  destination: { enabled: boolean; folder?: string };
  color: string;
}

export interface TaskTab extends Tab {
  id: string;
  name: TabType | string;
  color: ColorLevel;
  sort?: TaskTabSort;
  reverse?: boolean;
}

export enum TaskTabSort {
  creation = 'creation',
  destination = 'destination',
  speed = 'speed',
  size = 'size',
  status = 'status',
  title = 'title',
}

/**
 * Enumeration for message types
 */
export enum TabType {
  all = 'all',
  downloading = 'downloading',
  completed = 'completed',
  active = 'active',
  inactive = 'inactive',
  stopped = 'stopped',
}

export type TabCount = Record<string, number>;

export const defaultTabs: TaskTab[] = [
  {
    id: uuid(),
    name: TabType.all,
    template: TabType.all,
    status: Object.values(TaskStatus),
    destination: { enabled: false },
    color: ColorLevel.primary,
  },
  {
    id: uuid(),
    name: TabType.downloading,
    template: TabType.downloading,
    status: [TaskStatus.downloading, TaskStatus.waiting],
    destination: { enabled: false },
    color: ColorLevel.info,
  },
  {
    id: uuid(),
    name: TabType.completed,
    template: TabType.completed,
    status: [TaskStatus.finished],
    destination: { enabled: false },
    color: ColorLevel.success,
  },
  {
    id: uuid(),
    name: TabType.active,
    template: TabType.active,
    status: [TaskStatus.downloading, TaskStatus.finishing, TaskStatus.hash_checking, TaskStatus.extracting, TaskStatus.seeding],
    destination: { enabled: false },
    color: ColorLevel.secondary,
  },
  {
    id: uuid(),
    name: TabType.inactive,
    template: TabType.inactive,
    status: [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused, TaskStatus.error],
    destination: { enabled: false },
    color: ColorLevel.warning,
  },
  {
    id: uuid(),
    name: TabType.stopped,
    template: TabType.stopped,
    status: [TaskStatus.paused],
    destination: { enabled: false },
    color: ColorLevel.error,
  },
];
