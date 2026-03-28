import type { CaseReducer, PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

import type { ScrapedContents, ScrapedPage } from '../../models/scraped-content.model';
import type { ScrapedSlice } from '../../models/store.model';

import { createSlice } from '@reduxjs/toolkit';

import { emptyContents } from '../../models/scraped-content.model';

export interface ScrapedReducers<S = ScrapedSlice> extends SliceCaseReducers<S> {
  setScrapedPage: CaseReducer<S, PayloadAction<ScrapedPage>>;
  clearScrapedPage: CaseReducer<S>;
  setScrapedContents: CaseReducer<S, PayloadAction<ScrapedContents>>;
  clearScrapedContents: CaseReducer<S>;
}

const initialState: ScrapedSlice = {
  page: { title: '', origin: '', url: '' },
  contents: emptyContents,
};

export const scrapedSlice = createSlice<ScrapedSlice, ScrapedReducers, 'scraped'>({
  name: 'scraped',
  initialState,
  reducers: {
    setScrapedPage: (state, { payload }) => ({ ...state, page: payload }),
    clearScrapedPage: state => ({ ...state, page: initialState.page }),
    setScrapedContents: (state, { payload }) => ({ ...state, contents: payload }),
    clearScrapedContents: state => ({ ...state, contents: initialState.contents }),
  },
});
