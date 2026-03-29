import type { Task } from '../../models/task.model';
import type { StoreState } from '../store';

import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';

import { ContentSource } from '../../models/content.model';
import { defaultSettings } from '../../models/settings.model';
import { TaskStatus } from '../../models/task.model';
import { downloadsSlice } from '../slices/downloads.slice';
import { navbarSlice } from '../slices/navbar.slice';
import { scrapedSlice } from '../slices/scraped.slice';
import { settingsSlice } from '../slices/settings.slice';
import { initialState as stateInitial, stateSlice } from '../slices/state.slice';
import { tasksSlice } from '../slices/tasks.slice';
import { getBadgeCount, getContents, getPollingEnabled, getPollingInterval } from './composite.selector';

vi.mock('../../utils/webex.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/webex.utils')>();
  return {
    ...actual,
    localSet: vi.fn(() => ({ subscribe: vi.fn() })),
    syncSet: vi.fn(() => ({ subscribe: vi.fn() })),
  };
});

vi.mock('../../utils/chrome/chrome.utils', () => ({
  setBadgeText: vi.fn(async () => Promise.resolve()),
  setBadgeBackgroundColor: vi.fn(async () => Promise.resolve()),
  setTitle: vi.fn(async () => Promise.resolve()),
  setIcon: vi.fn(async () => Promise.resolve()),
}));

function createTestStore(overrides?: Partial<StoreState>) {
  const store = configureStore({
    reducer: {
      [stateSlice.name]: stateSlice.reducer,
      [navbarSlice.name]: navbarSlice.reducer,
      [tasksSlice.name]: tasksSlice.reducer,
      [downloadsSlice.name]: downloadsSlice.reducer,
      [scrapedSlice.name]: scrapedSlice.reducer,
      [settingsSlice.name]: settingsSlice.reducer,
    },
  });
  if (overrides) {
    // Dispatch actions to set up the desired state
    if (overrides.state) store.dispatch(stateSlice.actions.restoreState(overrides.state));
    if (overrides.settings) store.dispatch(settingsSlice.actions.setSettings(overrides.settings));
    if (overrides.tasks?.tasksIds?.length) {
      const tasks = Object.values(overrides.tasks.tasks);
      store.dispatch(tasksSlice.actions.setTasks(tasks));
    }
  }
  return store;
}

function makeTask(id: string, status: TaskStatus): Task {
  return {
    id,
    status,
    source: ContentSource.Task,
    key: `task-${id}`,
    title: id,
    size: 100,
  } as Task;
}

describe('composite.selector', () => {
  describe('getPollingInterval', () => {
    it('should return popup interval when modal is open', () => {
      const store = createTestStore({
        state: { ...stateInitial, modal: { ...stateInitial.modal, popup: true } },
      });
      const interval = getPollingInterval(store.getState());
      expect(interval).toBe(defaultSettings.polling.popup.interval);
    });

    it('should return background interval when modal is closed', () => {
      const store = createTestStore();
      const interval = getPollingInterval(store.getState());
      expect(interval).toBe(defaultSettings.polling.background.interval);
    });
  });

  describe('getPollingEnabled', () => {
    it('should be true when polling enabled and popup enabled when modal open', () => {
      const store = createTestStore({
        state: { ...stateInitial, modal: { ...stateInitial.modal, popup: true } },
        settings: { polling: { ...defaultSettings.polling, enabled: true, popup: { ...defaultSettings.polling.popup, enabled: true } } },
      });
      expect(getPollingEnabled(store.getState())).toBe(true);
    });

    it('should be false when polling globally disabled', () => {
      const store = createTestStore({
        settings: { polling: { ...defaultSettings.polling, enabled: false } },
      });
      expect(getPollingEnabled(store.getState())).toBe(false);
    });
  });

  describe('getContents', () => {
    it('should return only tasks when downloads disabled', () => {
      const store = createTestStore({
        settings: { downloads: { ...defaultSettings.downloads, enabled: false } },
        tasks: {
          tasks: { t1: makeTask('t1', TaskStatus.downloading) },
          tasksIds: ['t1'],
        } as StoreState['tasks'],
      });
      const contents = getContents(store.getState());
      expect(contents).toHaveLength(1);
      expect(contents[0].source).toBe(ContentSource.Task);
    });
  });

  describe('getBadgeCount', () => {
    it('should return 0 when no contents', () => {
      const store = createTestStore();
      expect(getBadgeCount(store.getState())).toBe(0);
    });

    it('should count tasks matching notification filter', () => {
      const store = createTestStore({
        tasks: {
          tasks: {
            t1: makeTask('t1', TaskStatus.downloading),
            t2: makeTask('t2', TaskStatus.finished),
          },
          tasksIds: ['t1', 't2'],
        } as StoreState['tasks'],
      });
      const count = getBadgeCount(store.getState());
      expect(count).toBeGreaterThan(0);
    });
  });
});
