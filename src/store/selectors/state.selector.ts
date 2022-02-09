import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';

export const getState = createSelector(
  (store: StoreState) => store,
  (store) => store.state
);

export const getModal = createSelector(getState, (state) => state.modal);

export const getPopup = createSelector(getModal, (modal) => modal?.popup);

export const getOption = createSelector(getModal, (modal) => modal?.option);

export const getLogged = createSelector(getState, (state) => state?.logged);

export const isModalOpen = createSelector(getPopup, getOption, (popup, option) => popup || option);

export const getLoading = createSelector(getState, (state) => state.loading);
