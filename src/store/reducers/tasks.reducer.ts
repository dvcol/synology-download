import { localSet } from '@dvcol/web-extension-utils';

import type { Task, TaskCount, TaskStatistics } from '@src/models';
import { formatBytes } from '@src/models';
import { setBadgeText, setTitle } from '@src/utils';

import { tasksSlice } from '../slices/tasks.slice';

import type { TasksReducers } from '../slices/tasks.slice';

export const setCountAndStats = (count?: TaskCount, stats?: TaskStatistics) => {
  // TODO : move to thunk ?
  let text = '';
  let title = 'No tasks found or task count disabled.';
  if (count) {
    text = `${count?.badge || ''}`;
    title = `Badge:  ${count.badge ?? 0} task${count.badge > 1 ? 's' : ''}`;
    title += `\nTotal:  ${count.badge ?? 0} task${count.badge > 1 ? 's' : ''}\n`;

    Object.keys(count.tabs)?.forEach(tab => {
      title += `\n${tab}: ${count.tabs[tab] ?? 0} task${count.tabs[tab] > 1 ? 's' : ''}`;
    });
  }

  if (stats) {
    if (title) title += '\n';
    (Object.keys(stats) as (keyof TaskStatistics)[])?.forEach(key => {
      title += `\n${key?.replaceAll('_', ' ')}: ${formatBytes(stats[key])}/s`;
    });
  }

  setBadgeText({ text }).then(() => console.debug('No count found'));
  setTitle({ title }).then();
};

export const setTasksCountReducer: TasksReducers['setTasksCount'] = (state, { payload: count }) => {
  setCountAndStats(count, state.stats);
  return { ...state, count };
};

export const setTasksStatsReducer: TasksReducers['setTaskStats'] = (state, { payload: stats }) => ({ ...state, stats });

export const syncTaskReducer: TasksReducers['setTasks'] = (state, { payload: entities }) => {
  // TODO : move to thunk ?
  localSet<Task[]>(tasksSlice.name, entities).subscribe(() => console.debug('Tasks sync success', entities));
  return { ...state, entities };
};
