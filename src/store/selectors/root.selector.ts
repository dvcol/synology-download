import { createSelector } from '@reduxjs/toolkit';

import type { StoreState } from '@src/store';

export const getRoot = createSelector(
  (state: StoreState) => state,
  state => state,
);
