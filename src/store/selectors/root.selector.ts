import type { StoreState } from '@src/store';

import { createSelector } from '@reduxjs/toolkit';

export const getRoot: (state: StoreState) => StoreState = createSelector(
  (state: StoreState) => state,
  state => state,
);
