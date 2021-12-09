import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksSlice, TaskStatus } from '../../models';
import { mockTasks } from './task.mock';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  setStatuses: CaseReducer<S, PayloadAction<TaskStatus[]>>;
  setTasksCount: CaseReducer<S, PayloadAction<number>>;
  resetTasks: CaseReducer<S>;
}

const setCount = (count?: string) => {
  chrome.action.setBadgeText({ text: count ?? '' }).then(() => console.debug('Badge changed to ', count));
  chrome.action.setTitle({ title: `${count ?? 0} task${Number(count) > 1 ? 's' : ''} currently on your Download Station` }).then();
};

const initialState: TasksSlice = {
  entities: mockTasks,
  statuses: [],
  count: undefined,
};

export const tasksSlice = createSlice<TasksSlice, TasksReducers, 'tasks'>({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, { payload: entities }) => ({ ...state, entities }),
    setStatuses: (state, { payload: statuses }) => ({ ...state, statuses }),
    setTasksCount: (state, { payload: count }) => {
      setCount(count.toString());
      return { ...state, count };
    },
    resetTasks: () => initialState,
  } as TasksReducers,
});

// Action creators are generated for each case reducer function
export const { setTasks, setStatuses, setTasksCount, resetTasks } = tasksSlice.actions;
