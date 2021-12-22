import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksSlice, TaskStatus } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  setStatuses: CaseReducer<S, PayloadAction<TaskStatus[]>>;
  setTasksCount: CaseReducer<S, PayloadAction<number>>;
  resetTasks: CaseReducer<S>;
}

const setCount = (count?: string, plural = false) => {
  // TODO : move to thunk ?
  chrome.action.setBadgeText({ text: count ?? '' }).then(() => console.debug('Badge changed to ', count));
  chrome.action.setTitle({ title: `${count ?? 0} task${plural ? 's' : ''} currently on your Download Station` }).then();
};

const initialState: TasksSlice = {
  entities: [],
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
      setCount(count ? count.toString() : '', count > 1);
      return { ...state, count };
    },
    resetTasks: () => initialState,
  } as TasksReducers,
});

// Action creators are generated for each case reducer function
export const { setTasks, setStatuses, setTasksCount, resetTasks } = tasksSlice.actions;
