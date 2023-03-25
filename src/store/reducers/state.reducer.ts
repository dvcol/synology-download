import type { ContentCount, Log, StateSlice, TaskStatistics } from '@src/models';
import { LoggerService } from '@src/services';
import { localSet, formatBytes, setBadgeText, setTitle } from '@src/utils';

import { stateSlice } from '../slices/state.slice';

import type { StateReducers } from '../slices/state.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

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

  setBadgeText({ text }).then();
  setTitle({ title }).then();
};

export const setBadgeReducer: StateReducers['setBadge'] = (state, { payload: { count, stats } }) => {
  setCountAndStats(count, stats);
  return { ...state, count };
};

type PartialState = Pick<StateSlice, 'logged' | 'history' | 'download'>;
export const syncStateReducer = (state: StateSlice): StateSlice => {
  const { logged, history, download } = state;
  // TODO : move to thunk ?
  localSet<PartialState>(stateSlice.name, { logged, history, download }).subscribe(_state => LoggerService.debug('State local sync success', _state));
  return state;
};

export const syncLoggedReducer: StateReducers['setLogged'] = (state, { payload: logged }) => {
  return syncStateReducer({ ...state, logged });
};

export const syncDestinationsHistoryReducer: CaseReducer<StateSlice, PayloadAction<string[]>> = (state, { payload: destinations }) => {
  return syncStateReducer({ ...state, history: { ...state.history, destinations: [...new Set(destinations.slice(0, 20))] } });
};

export const syncFoldersHistoryReducer: CaseReducer<StateSlice, PayloadAction<string[]>> = (state, { payload: folders }) => {
  return syncStateReducer({ ...state, history: { ...state.history, folders: [...new Set(folders.slice(0, 20))] } });
};

export const syncLogHistoryReducer: CaseReducer<StateSlice, PayloadAction<Log[]>> = (state, { payload: logs }) => {
  return syncStateReducer({ ...state, history: { ...state.history, logs: logs?.slice(0, 10000) ?? [] } });
};

export const syncDownloadStateReducer: StateReducers['syncDownloadState'] = (state, { payload: download }) => {
  return syncStateReducer({ ...state, download });
};
