import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultTabs, NavbarSlice, TaskTab } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

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
