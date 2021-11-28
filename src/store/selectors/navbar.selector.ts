import { createSelector } from '@reduxjs/toolkit';
import { NavbarState } from '../slices';

export const getTab = createSelector(
  (state: NavbarState) => state,
  (state) => state.navbar.tab
);
