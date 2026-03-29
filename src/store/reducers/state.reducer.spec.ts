/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call, import/first */
import type { Log } from '../../models/settings.model';
import type { StateSlice } from '../../models/store.model';

import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../utils/webex.utils', () => ({
  localSet: vi.fn(() => of(undefined)),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
}));

vi.mock('../../utils/chrome/chrome.utils', () => ({
  setBadgeText: vi.fn(async () => Promise.resolve()),
  setTitle: vi.fn(async () => Promise.resolve()),
  setIcon: vi.fn(async () => Promise.resolve()),
}));

vi.mock('../slices/state.slice', () => ({
  stateSlice: { name: 'state', actions: {} },
}));

vi.mock('../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn() },
}));

import { setBadgeText, setIcon, setTitle } from '../../utils/chrome/chrome.utils';
import { localSet } from '../../utils/webex.utils';
import {
  setCountAndStats,
  syncDestinationsHistoryReducer,
  syncDownloadStateReducer,
  syncFoldersHistoryReducer,
  syncLoggedReducer,
  syncLogHistoryReducer,
} from './state.reducer';

const mockSetBadgeText = vi.mocked(setBadgeText);
const mockSetTitle = vi.mocked(setTitle);
const mockSetIcon = vi.mocked(setIcon);
const mockLocalSet = vi.mocked(localSet);

const initialState: StateSlice = {
  logged: false,
  sid: undefined,
  modal: { popup: false, panel: false, option: false, standalone: false },
  content: { menu: false, dialog: false },
  loading: 0,
  badge: { count: undefined, stats: undefined },
  history: { destinations: [], folders: [], logs: [] },
  download: { enabled: false, defaultFolder: undefined },
  api: {},
} as StateSlice;

describe('state.reducer', () => {
  describe('setCountAndStats', () => {
    it('should set default text and title when no count is provided', async () => {
      await setCountAndStats();

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: '' });
      expect(mockSetTitle).toHaveBeenCalledWith({ title: 'No tasks found or task count disabled.' });
    });

    it('should format badge text and title when count is provided', async () => {
      const count = { badge: 3, total: 5, tabs: { downloading: 2, seeding: 1 } };

      await setCountAndStats(count);

      expect(mockSetBadgeText).toHaveBeenCalledWith({ text: '3' });
      const titleArg = mockSetTitle.mock.calls[0][0] as { title: string };
      expect(titleArg.title).toContain('Badge:  3 tasks');
      expect(titleArg.title).toContain('downloading: 2 tasks');
      expect(titleArg.title).toContain('seeding: 1 task');
    });

    it('should append speed lines when stats are provided', async () => {
      const stats = { speed_download: 1024, speed_upload: 512, emule_speed_download: 0, emule_speed_upload: 0 };

      await setCountAndStats(undefined, stats);

      const titleArg = mockSetTitle.mock.calls[0][0] as { title: string };
      expect(titleArg.title).toContain('speed download:');
      expect(titleArg.title).toContain('speed upload:');
      expect(titleArg.title).toContain('/s');
    });
  });

  describe('syncLoggedReducer', () => {
    it('should call setIcon with enabled icon on login (false -> true)', () => {
      mockSetIcon.mockClear();

      syncLoggedReducer(initialState, { type: 'test', payload: true });

      expect(mockSetIcon).toHaveBeenCalled();
      const call = mockSetIcon.mock.calls[0][0] as { path: Record<number, string> };
      expect(call.path[16]).toContain('icon-16.png');
      expect(call.path[16]).not.toContain('-disabled');
    });

    it('should call setIcon with disabled icon on logout (true -> false)', () => {
      mockSetIcon.mockClear();

      const loggedInState = { ...initialState, logged: true };
      syncLoggedReducer(loggedInState, { type: 'test', payload: false });

      expect(mockSetIcon).toHaveBeenCalled();
      const call = mockSetIcon.mock.calls[0][0] as { path: Record<number, string> };
      expect(call.path[16]).toContain('icon-disabled-16.png');
    });

    it('should not call setIcon when logged value does not change', () => {
      mockSetIcon.mockClear();

      syncLoggedReducer(initialState, { type: 'test', payload: false });

      expect(mockSetIcon).not.toHaveBeenCalled();
    });
  });

  describe('syncDestinationsHistoryReducer', () => {
    it('should deduplicate destinations', () => {
      const result = syncDestinationsHistoryReducer(initialState, { type: 'test', payload: ['a', 'b', 'a', 'c', 'b'] });
      expect(result.history.destinations).toEqual(['a', 'b', 'c']);
    });

    it('should cap destinations at 20', () => {
      const destinations = Array.from({ length: 30 }, (_, i) => `dest-${i}`);
      const result = syncDestinationsHistoryReducer(initialState, { type: 'test', payload: destinations });
      expect(result.history.destinations).toHaveLength(20);
    });

    it('should call localSet for sync', () => {
      mockLocalSet.mockClear();
      syncDestinationsHistoryReducer(initialState, { type: 'test', payload: ['a'] });
      expect(mockLocalSet).toHaveBeenCalled();
    });
  });

  describe('syncFoldersHistoryReducer', () => {
    it('should deduplicate folders', () => {
      const result = syncFoldersHistoryReducer(initialState, { type: 'test', payload: ['x', 'y', 'x', 'z'] });
      expect(result.history.folders).toEqual(['x', 'y', 'z']);
    });

    it('should cap folders at 20', () => {
      const folders = Array.from({ length: 25 }, (_, i) => `folder-${i}`);
      const result = syncFoldersHistoryReducer(initialState, { type: 'test', payload: folders });
      expect(result.history.folders).toHaveLength(20);
    });
  });

  describe('syncLogHistoryReducer', () => {
    it('should cap logs at 10000', () => {
      const logs: Log[] = Array.from({ length: 12000 }, (_, i) => ({
        timestamp: `ts-${i}`,
        level: 0,
        source: 0,
        value: `log-${i}`,
      })) as Log[];
      const result = syncLogHistoryReducer(initialState, { type: 'test', payload: logs });
      expect(result.history.logs).toHaveLength(10000);
    });

    it('should default to empty array when logs is undefined', () => {
      const result = syncLogHistoryReducer(initialState, { type: 'test', payload: undefined as unknown as Log[] });
      expect(result.history.logs).toEqual([]);
    });
  });

  describe('syncDownloadStateReducer', () => {
    it('should set download state', () => {
      const download = { enabled: true, defaultFolder: '/shared' };
      const result = syncDownloadStateReducer(initialState, { type: 'test', payload: download });
      expect(result.download).toEqual(download);
    });

    it('should call localSet for sync', () => {
      mockLocalSet.mockClear();
      const download = { enabled: false, defaultFolder: undefined };
      syncDownloadStateReducer(initialState, { type: 'test', payload: download });
      expect(mockLocalSet).toHaveBeenCalled();
    });
  });
});
