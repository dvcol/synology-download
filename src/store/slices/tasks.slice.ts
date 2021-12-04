import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksSlice, TaskStatus } from '../../models';
import { mockTasks } from './task.mock';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  setStatuses: CaseReducer<S, PayloadAction<TaskStatus[]>>;
  resetTasks: CaseReducer<S>;
}

const initialState: TasksSlice = {
  entities: mockTasks,
  statuses: [],
};

export const tasksSlice = createSlice<TasksSlice, TasksReducers, 'tasks'>({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => ({
      ...state,
      entities: action?.payload,
    }),
    setStatuses: (state, action: PayloadAction<TaskStatus[]>) => ({
      ...state,
      statuses: action?.payload,
    }),
    resetTasks: () => initialState,
  } as TasksReducers,
});

// Action creators are generated for each case reducer function
export const { setTasks, setStatuses, resetTasks } = tasksSlice.actions;
