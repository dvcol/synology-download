import { TasksReducers, tasksSlice } from '../slices';

export const setCount = (count?: string, plural = false) => {
  // TODO : move to thunk ?
  chrome.action.setBadgeText({ text: count ?? '' }).then(() => console.debug('Badge changed to ', count));
  chrome.action.setTitle({ title: `${count ?? 0} task${plural ? 's' : ''} currently on your Download Station` }).then();
};

export const setTasksCountReducer: TasksReducers['setTasksCount'] = (state, { payload: count }) => {
  setCount(count ? count.toString() : '', count > 1);
  return { ...state, count };
};

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : move to thunk ?
  chrome.storage.sync.set({ [tasksSlice.name]: JSON.stringify(entities) }, () => console.debug('Tasks sync success', entities));
  return { ...state, entities };
};
