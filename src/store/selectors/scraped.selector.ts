import type { ScrapedContent, ScrapedContents, ScrapedSlice } from '@src/models';

import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';

const getScraped: (state: StoreState) => StoreState['scraped'] = createSelector(
  (state: StoreState) => state,
  state => state.scraped,
);

export const getScrapedPage: (state: StoreState) => ScrapedSlice['page'] = createSelector(getScraped, (scraped: ScrapedSlice) => scraped.page);
export const getScrapedContents: (state: StoreState) => ScrapedContents = createSelector(getScraped, (scraped: ScrapedSlice) => scraped.contents);

const getScrappedContentList = createSelector(getScrapedContents, (contents: ScrapedContents) => [
  ...contents.links.filter(({ type }) => type === 'magnet'),
  ...contents.videos,
  ...contents.audios,
  ...contents.images,
  ...contents.links.filter(({ type }) => type !== 'magnet'),
]);

export const getScrappedRows: (state: StoreState) => Array<ScrapedContent & { id: number }> = createSelector(getScrappedContentList, (contents: ScrapedContent[]) =>
  contents?.map((content, index) => ({
    id: index,
    ...content,
  })));
