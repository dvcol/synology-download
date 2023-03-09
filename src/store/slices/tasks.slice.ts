import { createSlice } from '@reduxjs/toolkit';

import type { Task, TaskComplete, TasksSlice, TaskStatistics } from '@src/models';

import { setTasksStatsReducer, syncTaskReducer } from '@src/store/reducers/tasks.reducer';

import { uniqueArray } from '@src/utils';

import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

export interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  addStopping: CaseReducer<S, PayloadAction<TaskComplete>>;
  removeStopping: CaseReducer<S, PayloadAction<TaskComplete['taskId'] | TaskComplete['taskId'][]>>;
  resetStopping: CaseReducer<S>;
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  spliceTasks: CaseReducer<S, PayloadAction<Task['id'] | Task['id'][]>>;
  setTaskStats: CaseReducer<S, PayloadAction<TaskStatistics>>;
  resetTasks: CaseReducer<S>;
}

const initialState: TasksSlice = {
  stopping: [],
  entities: [],
  stats: undefined,
};

export const tasksSlice = createSlice<TasksSlice, TasksReducers, 'tasks'>({
  name: 'tasks',
  initialState,
  reducers: {
    addStopping: (state, { payload: task }) => ({
      ...state,
      stopping: uniqueArray([...state.stopping, task], ({ taskId }) => taskId === task.taskId),
    }),
    removeStopping: (state, { payload: ids }) => ({
      ...state,
      stopping: state.stopping?.filter(({ taskId }) => (Array.isArray(ids) ? !ids.includes(taskId) : taskId !== ids)),
    }),
    resetStopping: state => ({ ...state, stopping: initialState.stopping }),
    setTasks: syncTaskReducer,
    spliceTasks: (state, { payload: ids }) => ({
      ...state,
      entities: state.entities?.filter(e => (Array.isArray(ids) ? !ids.includes(e.id) : e.id !== ids)),
    }),
    setTaskStats: setTasksStatsReducer,
    resetTasks: () => initialState,
  } as TasksReducers,
});
