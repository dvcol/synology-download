import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TaskCount, TasksSlice } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { setTasksCountReducer, syncTaskReducer } from '../reducers';

export interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  spliceTasks: CaseReducer<S, PayloadAction<string | string[]>>;
  setTasksCount: CaseReducer<S, PayloadAction<TaskCount>>;
  resetTasks: CaseReducer<S>;
}

const initialState: TasksSlice = {
  entities: [],
  count: undefined,
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
    resetTasks: () => initialState,
  } as TasksReducers,
});
