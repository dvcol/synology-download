import { createSelector } from '@reduxjs/toolkit';
import { Task, TaskStatus, TaskStatusType } from '@src/models';
import { StoreState } from '../store';

export const getTasks = createSelector(
  (state: StoreState) => state,
  (state) => state.tasks.entities
);

export const geTasksIdsByStatusTypeReducer = (tasks: Task[]) =>
  tasks?.reduce(
    (map, { id, status }) => {
      switch (status) {
        case TaskStatus.downloading:
        case TaskStatus.seeding:
          map[TaskStatusType.active].add(id);
          break;
        case TaskStatus.paused:
        case TaskStatus.waiting:
        case TaskStatus.filehosting_waiting:
          map[TaskStatusType.paused].add(id);
          break;
        case TaskStatus.finishing:
        case TaskStatus.extracting:
        case TaskStatus.hash_checking:
          map[TaskStatusType.finishing].add(id);
          break;
        case TaskStatus.finished:
          map[TaskStatusType.finished].add(id);
          break;
        case TaskStatus.error:
          map[TaskStatusType.error].add(id);
          break;
      }
      map[TaskStatusType.all].add(id);
      return map;
    },
    Object.values(TaskStatusType).reduce((acc, type) => {
      acc[type] = new Set<Task['id']>();
      return acc;
    }, {} as Record<TaskStatusType, Set<Task['id']>>)
  );

export const geTasksIdsByStatusType = createSelector(getTasks, geTasksIdsByStatusTypeReducer);

export const getTasksIds = createSelector(geTasksIdsByStatusType, (tasksIds) => tasksIds[TaskStatusType.all]);

export const getPausedTasksIds = createSelector(geTasksIdsByStatusType, (tasksIds) => tasksIds[TaskStatusType.paused]);

export const getActiveTasksIds = createSelector(geTasksIdsByStatusType, (tasksIds) => tasksIds[TaskStatusType.active]);

export const getFinishedTasksIds = createSelector(geTasksIdsByStatusType, (tasksIds) => tasksIds[TaskStatusType.finished]);

export const getErrorTasksIds = createSelector(geTasksIdsByStatusType, (tasksIds) => tasksIds[TaskStatusType.error]);
