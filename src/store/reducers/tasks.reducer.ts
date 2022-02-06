import { TasksReducers, tasksSlice } from '../slices';
import { TaskCount } from '@src/models';

export const setCount = (count?: TaskCount) => {
  // TODO : move to thunk ?
  if (count) {
    chrome.action.setBadgeText({ text: `${count?.badge || ''}` }).then(() => console.debug('Badge changed to ', count?.badge));
    let title = `Badge:  ${count.badge ?? 0} task${count.badge > 1 ? 's' : ''}`;
    title = `${title}\nTotal:  ${count.badge ?? 0} task${count.badge > 1 ? 's' : ''}`;

    Object.keys(count.tabs)?.forEach((tab) => (title = `${title}\n${tab}: ${count.tabs[tab] ?? 0} task${count.tabs[tab] > 1 ? 's' : ''}`));

    chrome.action.setTitle({ title }).then();
  } else {
    chrome.action.setBadgeText({ text: '' }).then(() => console.debug('No count found'));
    chrome.action.setTitle({ title: 'No tasks found or task count disabled.' }).then();
  }
};

export const setTasksCountReducer: TasksReducers['setTasksCount'] = (state, { payload: count }) => {
  setCount(count);
  return { ...state, count };
};

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : Notification finished/error
  // TODO : move to thunk ?
  chrome.storage.sync.set({ [tasksSlice.name]: JSON.stringify(entities) }, () => console.debug('Tasks sync success', entities));
  return { ...state, entities };
};
