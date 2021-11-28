import { createSelector } from '@reduxjs/toolkit';
import { TasksState } from '../slices';
import { TaskStatus } from '../../models';

export const getTasks = createSelector(
  (state: TasksState) => state,
  (state) => state.tasks.entities
);

export const getStatuses = createSelector(
  (state: TasksState) => state,
  (state) => state.tasks.statuses
);

export const getFilteredTasks = createSelector(
  getTasks,
  getStatuses,
  (tasks, statuses) =>
    statuses?.length ? tasks.filter((t) => statuses.includes(t.status)) : tasks
);

export const getCountByStatus = createSelector(getTasks, (tasks) => {
  const count: { [status: string]: number } = { total: tasks?.length };
  Object.keys(TaskStatus).forEach(
    (status) =>
      (count[status] = tasks.reduce(
        (acc, t) => (t.status === status ? acc + 1 : acc),
        0
      ))
  );
  return count;
});
