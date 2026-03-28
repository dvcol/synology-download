import type { Content, ContentStatusTypeId, Task, TaskFile } from '@src/models';

import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';
import { ContentSource, ContentStatusType, TaskStatus } from '@src/models';
import { LoggerService } from '@src/services/logger/logger.service';

export const getTasks: (state: StoreState) => StoreState['tasks']['tasks'] = createSelector(
  (state: StoreState) => state,
  state => state.tasks.tasks,
);

export const getTaskFiles: (state: StoreState) => StoreState['tasks']['files'] = createSelector(
  (state: StoreState) => state,
  state => state.tasks.files,
);

export const getStats: (state: StoreState) => StoreState['tasks']['stats'] = createSelector(
  (state: StoreState) => state,
  state => state.tasks.stats,
);

export const getStopping: (state: StoreState) => StoreState['tasks']['stopping'] = createSelector(
  (state: StoreState) => state,
  state => state.tasks.stopping,
);

export const getTaskForm: (state: StoreState) => StoreState['tasks']['taskForm'] = createSelector(
  (state: StoreState) => state,
  state => state.tasks.taskForm,
);

export const getStoppingIds: (state: StoreState) => string[] = createSelector(getStopping, tasks => Object.keys(tasks));

export const getTasksArray: (state: StoreState) => Task[] = createSelector(getTasks, (tasks: Record<string, Task>) => Object.values(tasks));

export function geTasksIdsByStatusTypeReducer(items: Content[]) {
  return items
    ?.filter(item => item.source === ContentSource.Task)
    ?.map(item => item as Task)
    .reduce(
      (map, { id, status }) => {
        switch (status) {
          case TaskStatus.downloading:
          case TaskStatus.seeding:
            map[ContentStatusType.active].add(id);
            break;
          case TaskStatus.paused:
            map[ContentStatusType.paused].add(id);
            break;
          case TaskStatus.waiting:
          case TaskStatus.filehosting_waiting:
            map[ContentStatusType.waiting].add(id);
            break;
          case TaskStatus.finishing:
          case TaskStatus.extracting:
          case TaskStatus.hash_checking:
            map[ContentStatusType.finishing].add(id);
            break;
          case TaskStatus.finished:
            map[ContentStatusType.finished].add(id);
            break;
          case TaskStatus.error:
            map[ContentStatusType.error].add(id);
            break;
          default:
            LoggerService.error(`Status ${status as string} is not supported`);
        }
        map[ContentStatusType.all].add(id);
        return map;
      },
      Object.values(ContentStatusType).reduce((acc, type) => {
        acc[type] = new Set<Task['id']>();
        return acc;
      }, {} as ContentStatusTypeId<Task['id']>),
    );
}

export const getTasksIdsByStatusType: (state: StoreState) => ContentStatusTypeId<Task['id']> = createSelector(getTasksArray, geTasksIdsByStatusTypeReducer);

export const getTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.all]);
export const getErrorTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.error]);
export const getPausedTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.paused]);
export const getActiveTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.active]);
export const getWaitingTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.waiting]);
export const getFinishedTasksIds: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.finished]);

export const getTaskById: (id: string) => (state: StoreState) => Task = (id: string) => createSelector(getTasks, tasks => tasks[id]);

export const getTaskFilesById: (id: string) => (state: StoreState) => TaskFile[] = (id: string) => createSelector(getTaskFiles, files => files[id]);
