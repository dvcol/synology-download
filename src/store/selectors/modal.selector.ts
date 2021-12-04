import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';

export const getPopup = createSelector(
  (state: StoreState) => state,
  (state) => state.modal.popup
);

export const getOption = createSelector(
  (state: StoreState) => state,
  (state) => state.modal.option
);

export const isModalOpen = createSelector(getPopup, getOption, (popup, option) => popup || option);
