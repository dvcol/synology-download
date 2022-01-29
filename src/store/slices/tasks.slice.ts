import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, TasksSlice, TaskStatus } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface TasksReducers<S = TasksSlice> extends SliceCaseReducers<S> {
  setTasks: CaseReducer<S, PayloadAction<Task[]>>;
  spliceTasks: CaseReducer<S, PayloadAction<string | string[]>>;
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
    spliceTasks: (state, { payload: ids }) => ({
      ...state,
      entities: state.entities?.filter((e) => (Array.isArray(ids) ? !ids.includes(e.id) : e.id !== ids)),
    }),
    setStatuses: (state, { payload: statuses }) => ({ ...state, statuses }),
    setTasksCount: (state, { payload: count }) => {
      setCount(count ? count.toString() : '', count > 1);
      return { ...state, count };
    },
    resetTasks: () => initialState,
  } as TasksReducers,
});

// Action creators are generated for each case reducer function
export const { setTasks, spliceTasks, setStatuses, setTasksCount, resetTasks } = tasksSlice.actions;
