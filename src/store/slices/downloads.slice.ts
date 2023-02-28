import { createSlice } from '@reduxjs/toolkit';

import type { Download, DownloadsSlice } from '@src/models';

import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

export interface DownloadsReducers<S = DownloadsSlice> extends SliceCaseReducers<S> {
  setDownloads: CaseReducer<S, PayloadAction<Download[]>>;
  spliceDownloads: CaseReducer<S, PayloadAction<Download['id'] | Download['id'][]>>;
  resetDownloads: CaseReducer<S>;
}

const initialState: DownloadsSlice = {
  entities: [],
};

export const downloadsSlice = createSlice<DownloadsSlice, DownloadsReducers, 'downloads'>({
  name: 'downloads',
  initialState,
  reducers: {
    setDownloads: (state, { payload: entities }) => ({ ...state, entities }),
    spliceDownloads: (state, { payload: ids }) => ({
      ...state,
      entities: state.entities?.filter(e => (Array.isArray(ids) ? !ids.includes(e.id) : e.id !== ids)),
    }),
    resetDownloads: () => initialState,
  } as DownloadsReducers,
});
