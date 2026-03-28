import type { ActionCreatorWithoutPayload, PayloadAction, Reducer } from '@reduxjs/toolkit';

import type { ScrapedContents, ScrapedPage } from '../../models/scraped-content.model';
import type { ScrapedSlice } from '../../models/store.model';

import { createSlice } from '@reduxjs/toolkit';

import { emptyContents } from '../../models/scraped-content.model';

const initialState: ScrapedSlice = {
  page: { title: '', origin: '', url: '' },
  contents: emptyContents,
};

interface ScrapedSliceType {
  name: 'scraped';
  reducer: Reducer<ScrapedSlice>;
  actions: {
    setScrapedPage: (payload: ScrapedPage) => PayloadAction<ScrapedPage>;
    clearScrapedPage: ActionCreatorWithoutPayload<'scraped/clearScrapedPage'>;
    setScrapedContents: (payload: ScrapedContents) => PayloadAction<ScrapedContents>;
    clearScrapedContents: ActionCreatorWithoutPayload<'scraped/clearScrapedContents'>;
  };
}

// eslint-disable-next-line ts/no-unsafe-assignment -- ScrapedSlice contains DOM types incompatible with immer's WritableNonArrayDraft
export const scrapedSlice: ScrapedSliceType = createSlice({
  name: 'scraped',
  initialState,
  reducers: {
    setScrapedPage: (_draft, { payload }: PayloadAction<ScrapedPage>): ScrapedSlice => ({ ...(_draft as ScrapedSlice), page: payload }),
    clearScrapedPage: (_draft): ScrapedSlice => ({ ...(_draft as ScrapedSlice), page: initialState.page }),
    setScrapedContents: (_draft, { payload }: PayloadAction<ScrapedContents>): ScrapedSlice => ({ ...(_draft as ScrapedSlice), contents: payload }),
    clearScrapedContents: (_draft): ScrapedSlice => ({ ...(_draft as ScrapedSlice), contents: initialState.contents }),
  },

}) as any;
