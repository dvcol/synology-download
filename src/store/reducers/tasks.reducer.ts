import type { SyncedTaskSlice } from '@src/models';

import { LoggerService } from '@src/services';
import { localSet } from '@src/utils';

import { tasksSlice } from '../slices/tasks.slice';

import type { TasksReducers } from '../slices/tasks.slice';

export const setTasksStatsReducer: TasksReducers['setTaskStats'] = (state, { payload: stats }) => ({ ...state, stats });

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
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
