import { createSelector } from '@reduxjs/toolkit';

import type { Content, ContentStatusTypeId, Task } from '@src/models';
import { ContentSource, ContentStatusType, TaskStatus } from '@src/models';

import type { StoreState } from '../store';

export const getTasks = createSelector(
  (state: StoreState) => state,
  state => state.tasks.entities,
);

export const getStats = createSelector(
  (state: StoreState) => state,
  state => state.tasks.stats,
);

export const geTasksIdsByStatusTypeReducer = (items: Content[]) =>
  items
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
            console.error(`Status ${status} is not supported`);
        }
        map[ContentStatusType.all].add(id);
        return map;
      },
      Object.values(ContentStatusType).reduce((acc, type) => {
        acc[type] = new Set<Task['id']>();
        return acc;
      }, {} as ContentStatusTypeId<Task['id']>),
    );

export const getTasksIdsByStatusType = createSelector(getTasks, geTasksIdsByStatusTypeReducer);

export const getTasksIds = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.all]);
export const getErrorTasksIds = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.error]);
export const getPausedTasksIds = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.paused]);
export const getActiveTasksIds = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.active]);
export const getFinishedTasksIds = createSelector(getTasksIdsByStatusType, map => map[ContentStatusType.finished]);
