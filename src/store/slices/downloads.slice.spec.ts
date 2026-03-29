/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-argument, ts/no-unsafe-call */
import type { Download } from '../../models/download.model';

import { describe, expect, it, vi } from 'vitest';

import { downloadsSlice } from './downloads.slice';

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

const { setDownloads, spliceDownloads, resetDownloads } = downloadsSlice.actions;

const reducer = downloadsSlice.reducer;

const initialState = { entities: [] };

describe('downloadsSlice', () => {
  it('setDownloads should set entities', () => {
    const downloads = [
      { id: 1, title: 'test-1' } as unknown as Download,
      { id: 2, title: 'test-2' } as unknown as Download,
    ];
    const state = reducer(initialState, setDownloads(downloads));
    expect(state.entities).toEqual(downloads);
    expect(state.entities).toHaveLength(2);
  });

  it('spliceDownloads should remove matching entity by single id', () => {
    const downloads = [
      { id: 1, title: 'test-1' } as unknown as Download,
      { id: 2, title: 'test-2' } as unknown as Download,
    ];
    let state = reducer(initialState, setDownloads(downloads));
    state = reducer(state, spliceDownloads(1));
    expect(state.entities).toHaveLength(1);
    expect(state.entities[0]).toEqual(expect.objectContaining({ id: 2 }));
  });

  it('spliceDownloads should remove matching entities by array of ids', () => {
    const downloads = [
      { id: 1, title: 'test-1' } as unknown as Download,
      { id: 2, title: 'test-2' } as unknown as Download,
      { id: 3, title: 'test-3' } as unknown as Download,
    ];
    let state = reducer(initialState, setDownloads(downloads));
    state = reducer(state, spliceDownloads([1, 3]));
    expect(state.entities).toHaveLength(1);
    expect(state.entities[0]).toEqual(expect.objectContaining({ id: 2 }));
  });

  it('resetDownloads should return initial state', () => {
    const downloads = [{ id: 1, title: 'test' } as unknown as Download];
    let state = reducer(initialState, setDownloads(downloads));
    state = reducer(state, resetDownloads());
    expect(state).toEqual(initialState);
  });
});
