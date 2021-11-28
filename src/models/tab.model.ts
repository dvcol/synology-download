import { ColorLevel } from './material-ui.model';
import { TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';

export interface TaskTab {
  id: string;
  name: TabType | string;
  status?: TaskStatus[];
  color?: ColorLevel;
  order?: string;
  reverse?: boolean;
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

export interface TabCount {
  [status: string]: number;
}

export const defaultTabs: TaskTab[] = [
  {
    id: uuid(),
    name: TabType.all,
    color: ColorLevel.primary,
  },
  {
    id: uuid(),
    name: TabType.downloading,
    status: [TaskStatus.downloading],
  },
  {
    id: uuid(),
    name: TabType.completed,
    status: [TaskStatus.finished],
    color: ColorLevel.success,
  },
  {
    id: uuid(),
    name: TabType.active,
    status: [
      TaskStatus.downloading,
      TaskStatus.finishing,
      TaskStatus.hash_checking,
      TaskStatus.extracting,
      TaskStatus.seeding,
    ],
  },
  {
    id: uuid(),
    name: TabType.inactive,
    status: [
      TaskStatus.waiting,
      TaskStatus.filehosting_waiting,
      TaskStatus.paused,
      TaskStatus.error,
    ],
    color: ColorLevel.warning,
  },
  {
    id: uuid(),
    name: TabType.stopped,
    status: [TaskStatus.paused],
    color: ColorLevel.error,
  },
];
