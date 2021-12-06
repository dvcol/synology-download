import { createSelector } from '@reduxjs/toolkit';
import { TabCount, TaskStatus } from '../../models';
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

export const getStatuses = createSelector(
  (state: StoreState) => state,
  (state) => state.tasks.statuses
);

export const getSortedTasks = createSelector(
  getTasks,
  // TODO implement custom sorting
  (tasks) => [...tasks].sort((a, b) => (a.additional?.detail?.create_time < b.additional?.detail?.create_time ? 1 : -1))
);

export const getFilteredTasks = createSelector(getSortedTasks, getStatuses, (tasks, statuses) =>
  statuses?.length ? tasks.filter((t) => statuses.includes(t.status)) : tasks
);

export const getCountByStatus = createSelector(getTasks, (tasks) => {
  const count: TabCount = { total: tasks?.length };
  Object.keys(TaskStatus).forEach((status) => (count[status] = tasks?.reduce((acc, t) => (t.status === status ? acc + 1 : acc), 0)));
  return count;
});
