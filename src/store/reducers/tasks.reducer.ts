import { TasksReducers, tasksSlice } from '../slices';

export const setCount = (count?: number, plural = false) => {
  // TODO : move to thunk ?
  chrome.action.setBadgeText({ text: `${count || ''}` }).then(() => console.debug('Badge changed to ', count));
  chrome.action.setTitle({ title: `${count ?? 0} task${plural ? 's' : ''} active.` }).then();
};

export const setTasksCountReducer: TasksReducers['setTasksCount'] = (state, { payload: count }) => {
  setCount(count.badge, count.badge > 1);
  return { ...state, count };
};

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : move to thunk ?
  chrome.storage.sync.set({ [tasksSlice.name]: JSON.stringify(entities) }, () => console.debug('Tasks sync success', entities));
  return { ...state, entities };
};
