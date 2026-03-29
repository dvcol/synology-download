import type { ScrapedContents, ScrapedPage } from '../../models/scraped-content.model';

import { describe, expect, it, vi } from 'vitest';

import { emptyContents } from '../../models/scraped-content.model';
import { scrapedSlice } from './scraped.slice';

vi.mock('../../utils/webex.utils', () => ({
  localSet: vi.fn(() => ({ subscribe: vi.fn() })),
  syncSet: vi.fn(() => ({ subscribe: vi.fn() })),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  ProxyLogger: class {
    debug = vi.fn(); info = vi.fn(); warn = vi.fn(); error = vi.fn();
  },
}));

vi.mock('../../utils/chrome/chrome.utils', () => ({
  setBadgeBackgroundColor: vi.fn(async () => Promise.resolve()),
  setBadgeText: vi.fn(async () => Promise.resolve()),
  setTitle: vi.fn(async () => Promise.resolve()),
  setIcon: vi.fn(async () => Promise.resolve()),
}));

const { setScrapedPage, clearScrapedPage, setScrapedContents, clearScrapedContents } = scrapedSlice.actions;

const reducer = scrapedSlice.reducer;

const initialState = {
  page: { title: '', origin: '', url: '' },
  contents: emptyContents,
};

describe('scrapedSlice', () => {
  it('setScrapedPage should set page', () => {
    const page: ScrapedPage = { title: 'My Page', origin: 'https://example.com', url: 'https://example.com/page' };
    const state = reducer(initialState, setScrapedPage(page));
    expect(state.page).toEqual(page);
  });

  it('clearScrapedPage should reset to initial page', () => {
    const page: ScrapedPage = { title: 'My Page', origin: 'https://example.com', url: 'https://example.com/page' };
    let state = reducer(initialState, setScrapedPage(page));
    state = reducer(state, clearScrapedPage());
    expect(state.page).toEqual(initialState.page);
  });

  it('setScrapedContents should set contents', () => {
    const contents: ScrapedContents = {
      images: [{ title: 'img', src: 'https://example.com/img.png' }],
      audios: [],
      videos: [],
      links: [],
    };
    const state = reducer(initialState, setScrapedContents(contents));
    expect(state.contents).toEqual(contents);
    expect(state.contents.images).toHaveLength(1);
  });

  it('clearScrapedContents should reset to initial contents', () => {
    const contents: ScrapedContents = {
      images: [{ title: 'img', src: 'https://example.com/img.png' }],
      audios: [],
      videos: [],
      links: [],
    };
    let state = reducer(initialState, setScrapedContents(contents));
    state = reducer(state, clearScrapedContents());
    expect(state.contents).toEqual(emptyContents);
  });
});
