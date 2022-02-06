import { createSelector } from '@reduxjs/toolkit';
import { TaskStatus } from '@src/models';
import { StoreState } from '../store';

export const getTasks = createSelector(
  (state: StoreState) => state,
  (state) => state.tasks.entities
);

export const getTasksIds = createSelector(getTasks, (tasks) => tasks?.map((t) => t.id));

export const getPausedTasks = createSelector(getTasks, (tasks) =>
  tasks?.filter((t) => [TaskStatus.waiting, TaskStatus.filehosting_waiting, TaskStatus.paused].includes(t.status))
);

export const getPausedTasksIds = createSelector(getPausedTasks, (tasks) => tasks?.map((t) => t.id));

export const getActiveTasks = createSelector(getTasks, (tasks) =>
  tasks?.filter((t) => [TaskStatus.downloading, TaskStatus.seeding].includes(t.status))
);

export const getActiveTasksIds = createSelector(getActiveTasks, (tasks) => tasks?.map((t) => t.id));

export const getFinishedTasks = createSelector(getTasks, (tasks) => tasks?.filter((t) => t.status === TaskStatus.finished));

export const getFinishedTasksIds = createSelector(getFinishedTasks, (tasks) => tasks?.map((t) => t.id));
