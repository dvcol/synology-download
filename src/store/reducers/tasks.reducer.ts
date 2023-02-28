import { localSet } from '@dvcol/web-extension-utils';

import type { Task } from '@src/models';

import { tasksSlice } from '../slices/tasks.slice';

import type { TasksReducers } from '../slices/tasks.slice';

export const setTasksStatsReducer: TasksReducers['setTaskStats'] = (state, { payload: stats }) => ({ ...state, stats });

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : move to thunk ?
  localSet<Task[]>(tasksSlice.name, entities).subscribe(() => console.debug('Tasks sync success', entities));
  return { ...state, entities };
};
