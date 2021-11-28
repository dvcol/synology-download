import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NavbarSlice, TaskTab } from '../../models';

const initialState: NavbarSlice = { tab: undefined };

export const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setNavbar: (state, action: PayloadAction<TaskTab | undefined>) => ({
      ...state,
      tab: action?.payload,
    }),
    resetNavbar: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const { setNavbar, resetNavbar } = navbarSlice.actions;

const rootReducer = combineReducers({
  navbar: navbarSlice.reducer,
});

export type NavbarState = ReturnType<typeof rootReducer>;

export default navbarSlice.reducer;
