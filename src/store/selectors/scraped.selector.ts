import { createSelector } from '@reduxjs/toolkit';

import type { ScrapedContent, ScrapedContents, ScrapedSlice } from '@src/models';

import type { StoreState } from '../store';

const getScraped = createSelector(
  (state: StoreState) => state,
  state => state.scraped,
);

export const getScrapedPage = createSelector(getScraped, (scraped: ScrapedSlice) => scraped.page);
export const getScrapedContents = createSelector(getScraped, (scraped: ScrapedSlice) => scraped.contents);

const getScrappedContentList = createSelector(getScrapedContents, (contents: ScrapedContents) => [
  ...contents.videos,
  ...contents.audios,
  ...contents.images,
  ...contents.links,
]);

export const getScrappedRows = createSelector(getScrappedContentList, (contents: ScrapedContent[]) =>
  contents?.map((content, index) => ({
    id: index,
    ...content,
  })),
);
