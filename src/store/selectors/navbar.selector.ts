import { createSelector } from '@reduxjs/toolkit';

import type { StoreState } from '../store';

export const getTab = createSelector(
  (state: StoreState) => state,
  state => state.navbar.tab,
);
