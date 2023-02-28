import { localSet } from '@dvcol/web-extension-utils';

import type { ContentCount, StateSlice, TaskStatistics } from '@src/models';
import { formatBytes, setBadgeText, setTitle } from '@src/utils';

import { stateSlice } from '../slices/state.slice';

import type { StateReducers } from '../slices/state.slice';

export const syncLoggedReducer: StateReducers['setLogged'] = (state, { payload: logged }) => {
  // TODO : move to thunk ?
  localSet<Pick<StateSlice, 'logged'>>(stateSlice.name, { logged }).subscribe(() => console.debug('State sync success', state));
  return { ...state, logged };
};

export const setCountAndStats = (count?: ContentCount, stats?: TaskStatistics) => {
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

export const setBadgeReducer: StateReducers['setBadge'] = (state, { payload: { count, stats } }) => {
  setCountAndStats(count, stats);
  return { ...state, count };
};
