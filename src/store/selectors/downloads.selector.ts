import { createSelector } from '@reduxjs/toolkit';

import type { StoreState } from '../store';

export const getDownloads = createSelector(
  (state: StoreState) => state,
  state => state.downloads.entities,
);
