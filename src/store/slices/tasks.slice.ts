import { createSlice } from '@reduxjs/toolkit';

import type { Task, TaskComplete, TaskFile, TasksSlice, TaskStatistics } from '@src/models';

import { setTasksStatsReducer, syncTaskReducer } from '@src/store/reducers/tasks.reducer';

import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

export interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  restoreTasks: CaseReducer<S, PayloadAction<Partial<S>>>;
  addStopping: CaseReducer<S, PayloadAction<TaskComplete>>;
  removeStopping: CaseReducer<S, PayloadAction<TaskComplete['taskId'] | TaskComplete['taskId'][]>>;
  resetStopping: CaseReducer<S>;
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  spliceTasks: CaseReducer<S, PayloadAction<Task['id'] | Task['id'][]>>;
  setTaskStats: CaseReducer<S, PayloadAction<TaskStatistics>>;
  resetTasks: CaseReducer<S>;
  resetFiles: CaseReducer<S>;
  setFiles: CaseReducer<S, PayloadAction<{ taskId: string; files: TaskFile[] }>>;
}

const initialState: TasksSlice = {
  stopping: {},
  tasks: {},
  tasksIds: [],
  files: {},
  filesIds: {},
  stats: undefined,
};

export const tasksSlice = createSlice<TasksSlice, TasksReducers, 'tasks'>({
  name: 'tasks',
  initialState,
  reducers: {
    restoreTasks: (state, { payload }) => ({ ...state, ...payload }),
    addStopping: (state, { payload: task }) => ({
      ...state,
      stopping: { ...state.stopping, [task.taskId]: task },
    }),
    removeStopping: (state, { payload: ids }) => {
      const _state = { ...state, stopping: { ...state.stopping } };
      const _ids = Array.isArray(ids) ? ids : [ids];
      _ids?.forEach(id => delete _state.stopping[id]);
      return _state;
    },
    resetStopping: state => ({ ...state, stopping: initialState.stopping }),
    setTasks: syncTaskReducer,
    spliceTasks: (state, { payload: ids }) => {
      const _ids = Array.isArray(ids) ? ids : [ids];
      const _state = { ...state, tasks: { ...state.tasks }, tasksIds: state.tasksIds?.filter(id => !ids.includes(id)) };
      _ids?.forEach(id => delete _state.tasks[id]);
      return _state;
    },
    setTaskStats: setTasksStatsReducer,
    resetTasks: () => initialState,
    setFiles: (state, { payload: { taskId, files } }) => ({ ...state, files: { ...state.files, [taskId]: files } }),
    resetFiles: state => ({ ...state, files: initialState.files, filesIds: initialState.filesIds }),
  } as TasksReducers,
});
