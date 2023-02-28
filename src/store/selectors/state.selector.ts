import { createSelector } from '@reduxjs/toolkit';

import type { StateSlice } from '@src/models';

import type { StoreState } from '../store';

export const getState = createSelector(
  (store: StoreState) => store,
  store => store.state,
);

export const getModal = createSelector(getState, (state: StateSlice) => state.modal);

export const getPopup = createSelector(getModal, (modal: StateSlice['modal']) => modal?.popup);

export const getOption = createSelector(getModal, (modal: StateSlice['modal']) => modal?.option);

export const getLogged = createSelector(getState, (state: StateSlice) => state?.logged);

export const getSid = createSelector(getState, (state: StateSlice) => state?.sid);

export const isModalOpen = createSelector(getPopup, getOption, (popup: boolean, option: boolean) => popup || option);

export const getLoading = createSelector(getState, (state: StateSlice) => state.loading);
