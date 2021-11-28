import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksSlice, TaskStatus } from '../../models';
import { mockTasks } from './task.mock';

const initialState: TasksSlice = {
  entities: mockTasks,
  statuses: [],
};

export const tasksSlice = createSlice({
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
  },
});

// Action creators are generated for each case reducer function
export const { setTasks, setStatuses, resetTasks } = tasksSlice.actions;

const rootReducer = combineReducers({
  tasks: tasksSlice.reducer,
});

export type TasksState = ReturnType<typeof rootReducer>;

export default tasksSlice.reducer;
