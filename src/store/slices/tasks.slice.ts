import type { PayloadAction } from '@reduxjs/toolkit';

import type { TasksSlice } from '../../models/store.model';
import type { Task, TaskComplete, TaskFile, TaskForm } from '../../models/task.model';

import { createSlice } from '@reduxjs/toolkit';

import { setTasksStatsReducer, syncTaskReducer } from '../reducers/tasks.reducer';

const initialState: TasksSlice = {
  taskForm: {},
  stopping: {},
  tasks: {},
  tasksIds: [],
  files: {},
  filesIds: {},
  stats: undefined,
};

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    restoreTasks: (state, { payload }: PayloadAction<Partial<TasksSlice>>) => ({ ...state, ...payload }),
    addStopping: (state, { payload: task }: PayloadAction<TaskComplete>) => ({
      ...state,
      stopping: { ...state.stopping, [task.taskId]: task },
    }),
    removeStopping: (state, { payload: ids }: PayloadAction<TaskComplete['taskId'] | TaskComplete['taskId'][]>) => {
      const _state = { ...state, stopping: { ...state.stopping } };
      const _ids = Array.isArray(ids) ? ids : [ids];
      _ids?.forEach(id => delete _state.stopping[id]);
      return _state;
    },
    resetStopping: state => ({ ...state, stopping: initialState.stopping }),
    addTasks: (state, { payload, type }: PayloadAction<Task[]>) => syncTaskReducer(state, { payload: [...Object.values(state.tasks), ...payload], type }),
    setTasks: syncTaskReducer,
    spliceTasks: (state, { payload: ids }: PayloadAction<Task['id'] | Task['id'][]>) => {
      const _ids = Array.isArray(ids) ? ids : [ids];
      const _state = { ...state, tasks: { ...state.tasks }, tasksIds: state.tasksIds?.filter(id => !ids.includes(id)) };
      _ids?.forEach(id => delete _state.tasks[id]);
      return _state;
    },
    setTaskStats: setTasksStatsReducer,
    resetTasks: () => initialState,
    setFiles: (state, { payload: { taskId, files } }: PayloadAction<{ taskId: string; files: TaskFile[] }>) => ({ ...state, files: { ...state.files, [taskId]: files } }),
    resetFiles: state => ({ ...state, files: initialState.files, filesIds: initialState.filesIds }),
    setTaskForm: (state, { payload }: PayloadAction<TaskForm>) => ({ ...state, taskForm: payload }),
    clearTaskForm: state => ({ ...state, taskForm: initialState.taskForm }),
  },
});
