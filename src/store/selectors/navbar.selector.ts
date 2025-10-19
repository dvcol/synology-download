import type { StoreState } from '@src/store';

import { createSelector } from '@reduxjs/toolkit';

export const getTab: (state: StoreState) => StoreState['navbar']['tab'] = createSelector(
  (state: StoreState) => state,
  state => state.navbar.tab,
);
