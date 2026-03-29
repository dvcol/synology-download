/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-argument */
import type { Log } from '../../models/settings.model';

import { describe, expect, it, vi } from 'vitest';

import { initialState, stateSlice } from './state.slice';

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

vi.mock('../../services/logger/logger.service', () => ({
  LoggerService: {
    init: vi.fn(),
    destroy: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    trace: vi.fn(),
  },
}));

vi.mock('../../services/query/query.service', () => ({
  QueryService: {
    init: vi.fn(),
    destroy: vi.fn(),
  },
}));

const {
  addLoading,
  removeLoading,
  resetLoading,
  setPopup,
  setPanel,
  setOption,
  setStandalone,
  setContentMenu,
  setContentDialog,
  addDestinationHistory,
  addFolderHistory,
  addLogHistory,
  resetLogHistory,
  restoreState,
  setSid,
  setApi,
} = stateSlice.actions;

const reducer = stateSlice.reducer;

describe('stateSlice', () => {
  describe('loading', () => {
    it('addLoading should increment by 1 without payload', () => {
      const state = reducer(initialState, addLoading(undefined));
      expect(state.loading).toBe(1);
    });

    it('addLoading should increment by payload', () => {
      const state = reducer(initialState, addLoading(3));
      expect(state.loading).toBe(3);
    });

    it('removeLoading should decrement by 1 without payload', () => {
      let state = reducer(initialState, addLoading(2));
      state = reducer(state, removeLoading(undefined));
      expect(state.loading).toBe(1);
    });

    it('removeLoading should decrement by payload', () => {
      let state = reducer(initialState, addLoading(5));
      state = reducer(state, removeLoading(3));
      expect(state.loading).toBe(2);
    });

    it('resetLoading should set to 0', () => {
      let state = reducer(initialState, addLoading(5));
      state = reducer(state, resetLoading());
      expect(state.loading).toBe(0);
    });
  });

  describe('modal flags', () => {
    it('setPopup should set popup', () => {
      const state = reducer(initialState, setPopup(true));
      expect(state.modal.popup).toBe(true);
    });

    it('setPanel should set panel', () => {
      const state = reducer(initialState, setPanel(true));
      expect(state.modal.panel).toBe(true);
    });

    it('setOption should set option', () => {
      const state = reducer(initialState, setOption(true));
      expect(state.modal.option).toBe(true);
    });

    it('setStandalone should set standalone', () => {
      const state = reducer(initialState, setStandalone(true));
      expect(state.modal.standalone).toBe(true);
    });
  });

  describe('content flags', () => {
    it('setContentMenu should set menu', () => {
      const state = reducer(initialState, setContentMenu(true));
      expect(state.content.menu).toBe(true);
    });

    it('setContentDialog should set dialog', () => {
      const state = reducer(initialState, setContentDialog(true));
      expect(state.content.dialog).toBe(true);
    });
  });

  describe('destination history', () => {
    it('addDestinationHistory should add to front', () => {
      let state = reducer(initialState, addDestinationHistory('/path/a'));
      state = reducer(state, addDestinationHistory('/path/b'));
      expect(state.history.destinations[0]).toBe('/path/b');
      expect(state.history.destinations[1]).toBe('/path/a');
    });

    it('addDestinationHistory should deduplicate', () => {
      let state = reducer(initialState, addDestinationHistory('/path/a'));
      state = reducer(state, addDestinationHistory('/path/a'));
      const count = state.history.destinations.filter(d => d === '/path/a').length;
      expect(count).toBeLessThanOrEqual(1);
    });

    it('addDestinationHistory should cap at max 20', () => {
      let state = initialState;
      for (let i = 0; i < 25; i++) {
        state = reducer(state, addDestinationHistory(`/path/${i}`));
      }
      expect(state.history.destinations.length).toBeLessThanOrEqual(20);
    });
  });

  describe('folder history', () => {
    it('addFolderHistory should add to front', () => {
      let state = reducer(initialState, addFolderHistory('/folder/a'));
      state = reducer(state, addFolderHistory('/folder/b'));
      expect(state.history.folders[0]).toBe('/folder/b');
      expect(state.history.folders[1]).toBe('/folder/a');
    });

    it('addFolderHistory should deduplicate', () => {
      let state = reducer(initialState, addFolderHistory('/folder/a'));
      state = reducer(state, addFolderHistory('/folder/a'));
      const count = state.history.folders.filter(f => f === '/folder/a').length;
      expect(count).toBeLessThanOrEqual(1);
    });

    it('addFolderHistory should cap at max 20', () => {
      let state = initialState;
      for (let i = 0; i < 25; i++) {
        state = reducer(state, addFolderHistory(`/folder/${i}`));
      }
      expect(state.history.folders.length).toBeLessThanOrEqual(20);
    });
  });

  describe('log history', () => {
    it('addLogHistory should append log', () => {
      const log = { message: 'test log', level: 'info' } as unknown as Log;
      const state = reducer(initialState, addLogHistory({ log, max: 100 }));
      expect(state.history.logs).toHaveLength(1);
      expect(state.history.logs[0]).toEqual(log);
    });

    it('addLogHistory should cap at max', () => {
      let state = initialState;
      for (let i = 0; i < 10; i++) {
        state = reducer(state, addLogHistory({ log: { message: `log-${i}` } as unknown as Log, max: 5 }));
      }
      expect(state.history.logs.length).toBeLessThanOrEqual(5);
    });

    it('resetLogHistory should clear logs', () => {
      const log = { message: 'test' } as unknown as Log;
      let state = reducer(initialState, addLogHistory({ log, max: 100 }));
      state = reducer(state, resetLogHistory());
      expect(state.history.logs).toEqual([]);
    });
  });

  it('restoreState should merge payload', () => {
    const state = reducer(initialState, restoreState({ loading: 5 }));
    expect(state.loading).toBe(5);
    expect(state.logged).toBe(false);
  });

  it('setSid should set sid', () => {
    const state = reducer(initialState, setSid('abc-123'));
    expect(state.sid).toBe('abc-123');
  });

  it('setApi should set api', () => {
    const api = { version: '1.0' } as any;
    const state = reducer(initialState, setApi(api));
    expect(state.api).toEqual(api);
  });
});
