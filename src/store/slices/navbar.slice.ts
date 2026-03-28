import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

import type { NavbarSlice } from '../../models/store.model';
import type { ContentTab } from '../../models/tab.model';

import { createSlice } from '@reduxjs/toolkit';

import { defaultTabs } from '../../models/tab.model';

interface NavbarReducers<S = NavbarSlice> extends SliceCaseReducers<S> {
  setNavbar: CaseReducer<S, PayloadAction<ContentTab | undefined>>;
  resetNavbar: CaseReducer<S>;
}

const initialState: NavbarSlice = { tab: defaultTabs[0] };

export const navbarSlice = createSlice<NavbarSlice, NavbarReducers, 'navbar'>({
  name: 'navbar',
  initialState,
  reducers: {
    setNavbar: (state, action: PayloadAction<ContentTab | undefined>) => ({
      ...state,
      tab: action?.payload,
    }),
    resetNavbar: () => initialState,
  } as NavbarReducers,
});
