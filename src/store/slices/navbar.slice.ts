import { createSlice } from '@reduxjs/toolkit';

import type { NavbarSlice, TaskTab } from '@src/models';

import { defaultTabs } from '@src/models';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import type { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

interface NavbarReducers<S = NavbarSlice> extends SliceCaseReducers<S> {
  setNavbar: CaseReducer<S, PayloadAction<TaskTab | undefined>>;
  resetNavbar: CaseReducer<S>;
}

const initialState: NavbarSlice = { tab: defaultTabs[0] };

export const navbarSlice = createSlice<NavbarSlice, NavbarReducers, 'navbar'>({
  name: 'navbar',
  initialState,
  reducers: {
    setNavbar: (state, action: PayloadAction<TaskTab | undefined>) => ({
      ...state,
      tab: action?.payload,
    }),
    resetNavbar: () => initialState,
  } as NavbarReducers,
});
