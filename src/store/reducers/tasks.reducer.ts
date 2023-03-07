import { localSet } from '@dvcol/web-extension-utils';

import type { Task } from '@src/models';

import { LoggerService } from '@src/services';

import { tasksSlice } from '../slices/tasks.slice';

import type { TasksReducers } from '../slices/tasks.slice';

export const setTasksStatsReducer: TasksReducers['setTaskStats'] = (state, { payload: stats }) => ({ ...state, stats });

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : move to thunk ?
  localSet<Task[]>(tasksSlice.name, entities).subscribe(() => LoggerService.debug('Tasks local sync success', entities));
  return { ...state, entities };
};
