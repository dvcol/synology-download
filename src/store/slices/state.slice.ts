import type { PayloadAction } from '@reduxjs/toolkit';

import type { Log } from '../../models/settings.model';
import type { StateSlice } from '../../models/store.model';
import type { InfoResponse } from '../../models/synology.model';

import { createSlice } from '@reduxjs/toolkit';

import {
  setBadgeReducer,
  syncDestinationsHistoryReducer,
  syncDownloadStateReducer,
  syncFoldersHistoryReducer,
  syncLoggedReducer,
  syncLogHistoryReducer,
} from '../reducers/state.reducer';

export const initialState: StateSlice = {
  logged: false,
  sid: undefined,
  modal: {
    popup: false,
    panel: false,
    option: false,
    standalone: false,
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
  api: {},
};

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    restoreState: (state, { payload }: PayloadAction<Partial<StateSlice>>) => ({ ...state, ...payload }),
    setLogged: syncLoggedReducer,
    setSid: (state, { payload: sid }: PayloadAction<string | undefined>) => ({ ...state, sid }),
    setPopup: (state, { payload: popup }: PayloadAction<boolean>) => ({ ...state, modal: { ...state.modal, popup } }),
    setPanel: (state, { payload: panel }: PayloadAction<boolean>) => ({ ...state, modal: { ...state.modal, panel } }),
    setOption: (state, { payload: option }: PayloadAction<boolean>) => ({ ...state, modal: { ...state.modal, option } }),
    setStandalone: (state, { payload: standalone }: PayloadAction<boolean>) => ({ ...state, modal: { ...state.modal, standalone } }),
    setContentMenu: (state, { payload: menu }: PayloadAction<boolean>) => ({ ...state, content: { ...state.content, menu } }),
    setContentDialog: (state, { payload: dialog }: PayloadAction<boolean>) => ({ ...state, content: { ...state.content, dialog } }),
    addLoading: (state, { payload }: PayloadAction<number | undefined>) => ({ ...state, loading: state.loading + (payload ?? 1) }),
    removeLoading: (state, { payload }: PayloadAction<number | undefined>) => ({ ...state, loading: state.loading - (payload ?? 1) }),
    resetLoading: state => ({ ...state, loading: 0 }),
    setBadge: setBadgeReducer,
    addDestinationHistory: (state, action: PayloadAction<string>) =>
      syncDestinationsHistoryReducer(state, {
        ...action,
        payload: [action.payload, ...(state.history?.destinations ?? initialState.history.destinations)],
      }),
    addFolderHistory: (state, action: PayloadAction<string>) =>
      syncFoldersHistoryReducer(state, { ...action, payload: [action.payload, ...(state.history?.folders ?? initialState.history.folders)] }),
    addLogHistory: (state, action: PayloadAction<{ log: Log; max: number }>) =>
      syncLogHistoryReducer(state, {
        ...action,
        payload: [...(state.history.logs ?? initialState.history.logs), action.payload.log].slice(0, action.payload.max),
      }),
    resetLogHistory: state => syncLogHistoryReducer(state, { type: 'state/resetLogHistory', payload: initialState.history.logs }),
    syncDownloadState: syncDownloadStateReducer,
    setApi: (state, { payload }: PayloadAction<InfoResponse>) => ({ ...state, api: payload }),
  },
});
