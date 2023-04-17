import { createSelector } from '@reduxjs/toolkit';

import type { Api, InfoResponse, StateSlice } from '@src/models';
import { DownloadStation2API } from '@src/models';
import { initialState } from '@src/store/slices/state.slice';

import type { StoreState } from '../store';

export const getState = createSelector(
  (store: StoreState) => store,
  store => store.state,
);

export const getModal = createSelector(getState, (state: StateSlice) => state.modal);

export const getPopup = createSelector(getModal, (modal: StateSlice['modal']) => modal?.popup);

export const getOption = createSelector(getModal, (modal: StateSlice['modal']) => modal?.option);

export const getStandalone = createSelector(getModal, (modal: StateSlice['modal']) => modal?.standalone);

export const getLogged = createSelector(getState, (state: StateSlice) => state?.logged);

export const getSid = createSelector(getState, (state: StateSlice) => state?.sid);

export const isModalOpen = createSelector(
  getPopup,
  getOption,
  getStandalone,
  (popup: boolean, option: boolean, standalone: boolean) => popup || option || standalone,
);

export const getLoading = createSelector(getState, (state: StateSlice) => state.loading);

export const getHistory = createSelector(getState, (state: StateSlice) => state?.history ?? initialState.history);

export const getDestinationsHistory = createSelector(getHistory, history => history?.destinations ?? initialState.history.destinations);

export const getFolderHistory = createSelector(getHistory, history => history?.folders ?? initialState.history.folders);

export const getLogHistory = createSelector(getHistory, history => history?.logs ?? initialState.history.logs);

export const getDownloadState = createSelector(getState, (state: StateSlice) => state.download ?? initialState.download);

export const getDefaultFolder = createSelector(
  getDownloadState,
  (state: StateSlice['download']) => state.defaultFolder ?? initialState.download.defaultFolder,
);

export const getApi = createSelector(getState, (state: StateSlice) => state.api);

export const getApiInfo = (api: Api) => createSelector(getApi, (apis: InfoResponse) => apis?.[api]);

export const getDownloadStation2APITask = getApiInfo(DownloadStation2API.Task);
export const getDownloadStation2APITaskBt = getApiInfo(DownloadStation2API.TaskBt);
export const getDownloadStation2APITaskBtFile = getApiInfo(DownloadStation2API.TaskBtFile);
export const getDownloadStation2APITaskComplete = getApiInfo(DownloadStation2API.TaskComplete);
