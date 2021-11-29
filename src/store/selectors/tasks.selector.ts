import { createSelector } from '@reduxjs/toolkit';
import { TasksState } from '../slices';
import { TabCount, TaskStatus } from '../../models';

export const getTasks = createSelector(
  (state: TasksState) => state,
  (state) => state.tasks.entities
);

export const getStatuses = createSelector(
  (state: TasksState) => state,
  (state) => state.tasks.statuses
);

export const getSortedTasks = createSelector(
  getTasks,
  // TODO implement custom sorting
  (tasks) => [...tasks].sort((a, b) => (a.additional?.detail?.create_time < b.additional?.detail?.create_time ? 1 : -1))
);

export const getFilteredTasks = createSelector(getSortedTasks, getStatuses, (tasks, statuses) => (statuses?.length ? tasks.filter((t) => statuses.includes(t.status)) : tasks));

export const getCountByStatus = createSelector(getTasks, (tasks) => {
  const count: TabCount = { total: tasks?.length };
  Object.keys(TaskStatus).forEach((status) => (count[status] = tasks.reduce((acc, t) => (t.status === status ? acc + 1 : acc), 0)));
  return count;
});
