import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

import { Task, TaskCount, TasksSlice, TaskStatistics } from '@src/models';
import { setTasksCountReducer, setTasksStatsReducer, syncTaskReducer } from '@src/store/reducers';

export interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  spliceTasks: CaseReducer<S, PayloadAction<string | string[]>>;
  setTasksCount: CaseReducer<S, PayloadAction<TaskCount>>;
  setTaskStats: CaseReducer<S, PayloadAction<TaskStatistics>>;
  resetTasks: CaseReducer<S>;
}

const initialState: TasksSlice = {
  entities: [],
  count: undefined,
  stats: undefined,
};

export const tasksSlice = createSlice<TasksSlice, TasksReducers, 'tasks'>({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: syncTaskReducer,
    spliceTasks: (state, { payload: ids }) => ({
      ...state,
      entities: state.entities?.filter((e) => (Array.isArray(ids) ? !ids.includes(e.id) : e.id !== ids)),
    }),
    setTasksCount: setTasksCountReducer,
    setTaskStats: setTasksStatsReducer,
    resetTasks: () => initialState,
  } as TasksReducers,
});
