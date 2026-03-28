import type { PayloadAction } from '@reduxjs/toolkit';

import type { NavbarSlice } from '../../models/store.model';
import type { ContentTab } from '../../models/tab.model';

import { createSlice } from '@reduxjs/toolkit';

import { defaultTabs } from '../../models/tab.model';

const initialState: NavbarSlice = { tab: defaultTabs[0] };

export const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setNavbar: (state, action: PayloadAction<ContentTab | undefined>) => ({
      ...state,
      tab: action?.payload,
    }),
    resetNavbar: () => initialState,
  },
});
