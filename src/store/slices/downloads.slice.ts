import type { PayloadAction } from '@reduxjs/toolkit';

import type { Download } from '../../models/download.model';
import type { DownloadsSlice } from '../../models/store.model';

import { createSlice } from '@reduxjs/toolkit';

const initialState: DownloadsSlice = {
  entities: [],
};

export const downloadsSlice = createSlice({
  name: 'downloads',
  initialState,
  reducers: {
    setDownloads: (state, { payload: entities }: PayloadAction<Download[]>) => ({ ...state, entities }),
    spliceDownloads: (state, { payload: ids }: PayloadAction<Download['id'] | Download['id'][]>) => ({
      ...state,
      entities: state.entities?.filter(e => (Array.isArray(ids) ? !ids.includes(e.id) : e.id !== ids)),
    }),
    resetDownloads: () => initialState,
  },
});
