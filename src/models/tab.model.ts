import { v4 as uuid } from 'uuid';

import { DownloadStatus } from './download.model';
import { ColorLevel } from './material-ui.model';
import { TaskStatus } from './task.model';

export type TabStatus = TaskStatus | DownloadStatus;
export interface Tab {
  template: TabTemplate;
  status: TabStatus[];
  destination: { enabled: boolean; folder?: string };
  color: string;
}

export interface ContentTab extends Tab {
  id: string;
  name: TabTemplate | string;
  color: ColorLevel;
  sort?: ContentTabSort;
  reverse?: boolean;
}

export enum ContentTabSort {
  creation = 'creation',
  destination = 'destination',
  speed = 'speed',
  size = 'size',
  status = 'status',
  title = 'title',
  progress = 'progress',
}

/**
 * Enumeration for message types
 */
export enum TabTemplate {
  all = 'all',
  downloading = 'downloading',
  completed = 'completed',
  active = 'active',
  inactive = 'inactive',
  stopped = 'stopped',
  downloads = 'downloads',
  tasks = 'tasks',
}

export type TabCount = Record<string, number>;

export const templateTabs: ContentTab[] = [
  {
    id: uuid(),
    name: TabTemplate.all,
    template: TabTemplate.all,
    status: [...Object.values(TaskStatus), ...Object.values(DownloadStatus)],
    destination: { enabled: false },
    color: ColorLevel.primary,
  },
  {
    id: uuid(),
    name: TabTemplate.downloading,
    template: TabTemplate.downloading,
    status: [TaskStatus.downloading, TaskStatus.waiting, DownloadStatus.downloading],
    destination: { enabled: false },
    color: ColorLevel.info,
  },
  {
    id: uuid(),
    name: TabTemplate.active,
    template: TabTemplate.active,
    status: [
      TaskStatus.downloading,
      TaskStatus.finishing,
      TaskStatus.hash_checking,
      TaskStatus.extracting,
      TaskStatus.seeding,
      DownloadStatus.downloading,
    ],
    destination: { enabled: false },
    color: ColorLevel.secondary,
  },
  {
    id: uuid(),
    name: TabTemplate.inactive,
    template: TabTemplate.inactive,
    status: [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused, TaskStatus.error, DownloadStatus.error, DownloadStatus.paused],
    destination: { enabled: false },
    color: ColorLevel.warning,
  },
  {
    id: uuid(),
    name: TabTemplate.completed,
    template: TabTemplate.completed,
    status: [TaskStatus.finished, DownloadStatus.complete, DownloadStatus.cancelled, DownloadStatus.deleted],
    destination: { enabled: false },
    color: ColorLevel.success,
  },
  {
    id: uuid(),
    name: TabTemplate.stopped,
    template: TabTemplate.stopped,
    status: [TaskStatus.paused, DownloadStatus.paused],
    destination: { enabled: false },
    color: ColorLevel.warning,
  },
  {
    id: uuid(),
    name: TabTemplate.tasks,
    template: TabTemplate.tasks,
    status: Object.values(TaskStatus),
    destination: { enabled: false },
    color: ColorLevel.info,
  },
  {
    id: uuid(),
    name: TabTemplate.downloads,
    template: TabTemplate.downloads,
    status: Object.values(DownloadStatus),
    destination: { enabled: false },
    color: ColorLevel.secondary,
  },
];

export const defaultTabs: ContentTab[] = [
  {
    id: uuid(),
    name: TabTemplate.all,
    template: TabTemplate.all,
    status: [...Object.values(TaskStatus)],
    destination: { enabled: false },
    color: ColorLevel.primary,
  },
  {
    id: uuid(),
    name: TabTemplate.active,
    template: TabTemplate.active,
    status: [TaskStatus.downloading, TaskStatus.finishing, TaskStatus.hash_checking, TaskStatus.extracting, TaskStatus.seeding],
    destination: { enabled: false },
    color: ColorLevel.secondary,
  },
  {
    id: uuid(),
    name: TabTemplate.inactive,
    template: TabTemplate.inactive,
    status: [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused, TaskStatus.error],
    destination: { enabled: false },
    color: ColorLevel.warning,
  },
  {
    id: uuid(),
    name: TabTemplate.completed,
    template: TabTemplate.completed,
    status: [TaskStatus.finished],
    destination: { enabled: false },
    color: ColorLevel.success,
  },
  {
    id: uuid(),
    name: TabTemplate.downloads,
    template: TabTemplate.downloads,
    status: Object.values(DownloadStatus),
    destination: { enabled: false },
    color: ColorLevel.secondary,
  },
];
