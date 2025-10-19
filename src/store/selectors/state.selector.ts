import type { Api, InfoResponse, StateSlice } from '@src/models';

import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';

import { DownloadStation2API } from '@src/models';
import { initialState } from '@src/store/slices/state.slice';

export const getState: (state: StoreState) => StateSlice = createSelector(
  (store: StoreState) => store,
  store => store.state,
);

export const getModal: (state: StoreState) => StateSlice['modal'] = createSelector(getState, (state: StateSlice) => state.modal);

export const getPopup: (state: StoreState) => boolean = createSelector(getModal, (modal: StateSlice['modal']) => modal?.popup);

export const getPanel: (state: StoreState) => boolean = createSelector(getModal, (modal: StateSlice['modal']) => modal?.panel);

export const getOption: (state: StoreState) => boolean = createSelector(getModal, (modal: StateSlice['modal']) => modal?.option);

export const getStandalone: (state: StoreState) => boolean = createSelector(getModal, (modal: StateSlice['modal']) => modal?.standalone);

export const getLogged: (state: StoreState) => boolean = createSelector(getState, (state: StateSlice) => state?.logged);

export const getSid: (state: StoreState) => string | undefined = createSelector(getState, (state: StateSlice) => state?.sid);

export const isModalOpen: (state: StoreState) => boolean = createSelector(
  getPopup,
  getPanel,
  getOption,
  getStandalone,
  (popup: boolean, panel: boolean, option: boolean, standalone: boolean) => popup || panel || option || standalone,
);

export const getLoading: (state: StoreState) => StateSlice['loading'] = createSelector(getState, (state: StateSlice) => state.loading);

export const getHistory: (state: StoreState) => StateSlice['history'] = createSelector(getState, (state: StateSlice) => state?.history ?? initialState.history);

export const getDestinationsHistory: (state: StoreState) => StateSlice['history']['destinations'] = createSelector(getHistory, history => history?.destinations ?? initialState.history.destinations);

export const getFolderHistory: (state: StoreState) => StateSlice['history']['folders'] = createSelector(getHistory, history => history?.folders ?? initialState.history.folders);

export const getLogHistory: (state: StoreState) => StateSlice['history']['logs'] = createSelector(getHistory, history => history?.logs ?? initialState.history.logs);

export const getDownloadState: (state: StoreState) => StateSlice['download'] = createSelector(getState, (state: StateSlice) => state.download ?? initialState.download);

export const getDefaultFolder: (state: StoreState) => string | undefined = createSelector(
  getDownloadState,
  (state: StateSlice['download']) => state.defaultFolder ?? initialState.download.defaultFolder,
);

export const getApi: (state: StoreState) => InfoResponse = createSelector(getState, (state: StateSlice) => state.api);

export const getApiInfo: (api: Api) => (state: StoreState) => InfoResponse[Api] = (api: Api) => createSelector(getApi, (apis: InfoResponse) => apis?.[api]);

export const getDownloadStation2APITask: (state: StoreState) => InfoResponse[Api] = getApiInfo(DownloadStation2API.Task);
export const getDownloadStation2APITaskBt: (state: StoreState) => InfoResponse[Api] = getApiInfo(DownloadStation2API.TaskBt);
export const getDownloadStation2APITaskBtFile: (state: StoreState) => InfoResponse[Api] = getApiInfo(DownloadStation2API.TaskBtFile);
export const getDownloadStation2APITaskComplete: (state: StoreState) => InfoResponse[Api] = getApiInfo(DownloadStation2API.TaskComplete);
