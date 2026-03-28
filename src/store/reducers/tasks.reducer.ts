import type { CaseReducer, PayloadAction } from '@reduxjs/toolkit';

import type { SyncedTaskSlice, TasksSlice } from '../../models/store.model';
import type { Task, TaskStatistics } from '../../models/task.model';

import { LoggerService } from '../../services/logger/logger.service';
import { localSet } from '../../utils/webex.utils';
import { tasksSlice } from '../slices/tasks.slice';

export const setTasksStatsReducer: CaseReducer<TasksSlice, PayloadAction<TaskStatistics>> = (state, { payload: stats }) => ({ ...state, stats });

export const syncTaskReducer: CaseReducer<TasksSlice, PayloadAction<Task[]>> = (state, { payload: entities }) => {
  // TODO : move to thunk ?

  const storedState: SyncedTaskSlice = entities?.reduce(
    (acc, task) => {
      acc.tasks[task.id] = task;
      acc.tasksIds.push(task.id);
      return acc;
    },
    { tasks: {}, tasksIds: [] } as SyncedTaskSlice,
  );

  localSet<SyncedTaskSlice>(tasksSlice.name, storedState).subscribe(() => LoggerService.debug('Tasks local sync success', entities));
  return { ...state, ...storedState };
};
