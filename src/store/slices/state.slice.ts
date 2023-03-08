import { createSlice } from '@reduxjs/toolkit';

import type { Log, StateSlice } from '@src/models';

import {
  setBadgeReducer,
  syncDestinationsHistoryReducer,
  syncDownloadStateReducer,
  syncFoldersHistoryReducer,
  syncLoggedReducer,
  syncLogHistoryReducer,
} from '@src/store/reducers/state.reducer';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import type { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

export interface StateReducers<S = StateSlice> extends SliceCaseReducers<S> {
  restoreState: CaseReducer<S, PayloadAction<Partial<S>>>;
  setLogged: CaseReducer<S, PayloadAction<boolean>>;
  setSid: CaseReducer<S, PayloadAction<string | undefined>>;
  setPopup: CaseReducer<S, PayloadAction<boolean>>;
  setOption: CaseReducer<S, PayloadAction<boolean>>;
  setContentMenu: CaseReducer<S, PayloadAction<boolean>>;
  setContentDialog: CaseReducer<S, PayloadAction<boolean>>;
  addLoading: CaseReducer<S, PayloadAction<number | undefined>>;
  removeLoading: CaseReducer<S, PayloadAction<number | undefined>>;
  resetLoading: CaseReducer<S>;
  setBadge: CaseReducer<S, PayloadAction<StateSlice['badge']>>;
  addDestinationHistory: CaseReducer<S, PayloadAction<string>>;
  addFolderHistory: CaseReducer<S, PayloadAction<string>>;
  addLogHistory: CaseReducer<S, PayloadAction<{ log: Log; max: number }>>;
  resetLogHistory: CaseReducer<S>;
  syncDownloadState: CaseReducer<S, PayloadAction<StateSlice['download']>>;
}

export const initialState: StateSlice = {
  logged: false,
  sid: undefined,
  modal: {
    popup: false,
    option: false,
  },
  content: {
    menu: false,
    dialog: false,
  },
  loading: 0,
  badge: { count: undefined, stats: undefined },
  history: {
    destinations: [],
    folders: [],
    logs: [],
  },
  download: {
    enabled: false,
    defaultFolder: undefined,
  },
};

export const stateSlice = createSlice<StateSlice, StateReducers, 'state'>({
  name: 'state',
  initialState,
  reducers: {
    restoreState: (state, { payload }) => ({ ...state, ...payload }),
    setLogged: syncLoggedReducer,
    setSid: (state, { payload: sid }) => ({ ...state, sid }),
    setPopup: (state, { payload: popup }) => ({ ...state, modal: { ...state.modal, popup } }),
    setOption: (state, { payload: option }) => ({ ...state, modal: { ...state.modal, option } }),
    setContentMenu: (state, { payload: menu }) => ({ ...state, content: { ...state.content, menu } }),
    setContentDialog: (state, { payload: dialog }) => ({ ...state, content: { ...state.content, dialog } }),
    addLoading: (state, { payload }) => ({ ...state, loading: state.loading + (payload ?? 1) }),
    removeLoading: (state, { payload }) => ({ ...state, loading: state.loading - (payload ?? 1) }),
    resetLoading: state => ({ ...state, loading: 0 }),
    setBadge: setBadgeReducer,
    addDestinationHistory: (state, action) =>
      syncDestinationsHistoryReducer(state, {
        ...action,
        payload: [action.payload, ...(state.history?.destinations ?? initialState.history.destinations)],
      }),
    addFolderHistory: (state, action) =>
      syncFoldersHistoryReducer(state, { ...action, payload: [action.payload, ...(state.history?.folders ?? initialState.history.folders)] }),
    addLogHistory: (state, action) =>
      syncLogHistoryReducer(state, {
        ...action,
        payload: [...(state.history.logs ?? initialState.history.logs), action.payload.log].slice(0, action.payload.max),
      }),
    resetLogHistory: (state, action) => syncLogHistoryReducer(state, { ...action, payload: initialState.history.logs }),
    syncDownloadState: syncDownloadStateReducer,
  } as StateReducers,
});
