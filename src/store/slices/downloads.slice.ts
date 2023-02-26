import { createSlice } from '@reduxjs/toolkit';

import type { Download, DownloadCount, DownloadsSlice } from '@src/models';

import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

export interface DownloadsReducers<S = DownloadsSlice> extends SliceCaseReducers<S> {
  setDownloads: CaseReducer<S, PayloadAction<Download[]>>;
  spliceDownloads: CaseReducer<S, PayloadAction<Download['id'] | Download['id'][]>>;
  setDownloadsCount: CaseReducer<S, PayloadAction<DownloadCount>>;
  resetDownloads: CaseReducer<S>;
}

const initialState: DownloadsSlice = {
  entities: [],
  count: undefined,
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
    setDownloadsCount: (state, { payload: count }) => ({ ...state, count }),
    resetDownloads: () => initialState,
  } as DownloadsReducers,
});
