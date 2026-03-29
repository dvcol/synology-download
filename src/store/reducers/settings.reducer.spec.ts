/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment */
import type { PayloadAction } from '@reduxjs/toolkit';

import type { ContextMenu } from '../../models/menu.model';
import type { AdvancedLogging, ConnectionSettings, DownloadsIntercept, GlobalSettings, NotificationSettings, SyncSettings } from '../../models/settings.model';
import type { SettingsSlice } from '../../models/store.model';

import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultConnection, defaultDownloads, defaultSettings, SyncSettingMode } from '../../models/settings.model';

vi.mock('../../utils/webex.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/webex.utils')>();
  return {
    ...actual,
    localSet: vi.fn(() => of(undefined)),
    syncSet: vi.fn(() => of(undefined)),
  };
});

vi.mock('../../utils/chrome/chrome.utils', () => ({
  setBadgeBackgroundColor: vi.fn(async () => Promise.resolve()),
}));

// Add setPanelBehavior to the chrome.sidePanel mock
(chrome.sidePanel as Record<string, unknown>).setPanelBehavior = vi.fn(async () => Promise.resolve());

const { localSet, syncSet } = await import('../../utils/webex.utils');
const { setBadgeBackgroundColor } = await import('../../utils/chrome/chrome.utils');

const {
  setReducer,
  syncReducer,
  setNestedReducer,
  syncNestedReducer,
  addTo,
  removeFrom,
  syncConnectionReducer,
  syncInterceptReducer,
  syncAdvancedLoggingReducer,
  setBadgeReducer,
  setSyncSettingsReducer,
  syncInterfaceReducer,
  saveSettings,
} = await import('./settings.reducer');

function makeAction<T>(payload: T): PayloadAction<T> {
  return { type: 'test', payload };
}

describe('settings.reducer', () => {
  let baseState: SettingsSlice;

  beforeEach(() => {
    vi.clearAllMocks();
    baseState = structuredClone(defaultSettings);
    // Default sync mode is 'sync' in defaultSettings, set to 'local' for most tests
    baseState.sync.mode = SyncSettingMode.local;
  });

  describe('setReducer', () => {
    it('should merge payload into state', () => {
      const result = setReducer(baseState, makeAction<Partial<SettingsSlice>>({ scrape: { menu: false } }));
      expect(result.scrape.menu).toBe(false);
      // Other fields remain unchanged
      expect(result.connection).toEqual(baseState.connection);
    });

    it('should not mutate the original state', () => {
      const original = structuredClone(baseState);
      setReducer(baseState, makeAction<Partial<SettingsSlice>>({ scrape: { menu: false } }));
      expect(baseState).toEqual(original);
    });
  });

  describe('syncReducer', () => {
    it('should merge payload and call saveSettings', () => {
      const result = syncReducer(baseState, makeAction<Partial<SettingsSlice>>({ content: { intercept: false } }));
      expect(result.content.intercept).toBe(false);
      // localSet is called by saveSettings (local mode)
      expect(localSet).toHaveBeenCalled();
    });

    it('should call syncSet when sync mode is sync', () => {
      baseState.sync.mode = SyncSettingMode.sync;
      syncReducer(baseState, makeAction<Partial<SettingsSlice>>({ content: { intercept: false } }));
      expect(syncSet).toHaveBeenCalled();
      expect(localSet).toHaveBeenCalled();
    });
  });

  describe('setNestedReducer', () => {
    it('should merge a nested key into state', () => {
      const result = setNestedReducer(baseState, { username: 'new-user' }, 'connection');
      expect(result.connection.username).toBe('new-user');
      // Other connection fields remain
      expect(result.connection.port).toBe(defaultConnection.port);
    });

    it('should not mutate the original state', () => {
      const original = structuredClone(baseState);
      setNestedReducer(baseState, { username: 'new-user' }, 'connection');
      expect(baseState).toEqual(original);
    });
  });

  describe('syncNestedReducer', () => {
    it('should merge nested key and call saveSettings', () => {
      const result = syncNestedReducer(baseState, { username: 'synced-user' }, 'connection');
      expect(result.connection.username).toBe('synced-user');
      expect(localSet).toHaveBeenCalled();
    });
  });

  describe('addTo', () => {
    it('should add a new item when no match is found', () => {
      const newMenu: ContextMenu = {
        id: 'new-menu',
        title: 'New Menu',
        contexts: [],
        modal: false,
        popup: false,
        panel: false,
        destination: { custom: false },
      };

      const result = addTo<ContextMenu, 'menus'>(baseState, newMenu, 'menus', m => m.id === newMenu.id);
      expect(result.menus).toHaveLength(baseState.menus.length + 1);
      expect(result.menus[result.menus.length - 1]).toEqual(newMenu);
    });

    it('should replace an existing item when filter matches by id', () => {
      const existingId = baseState.menus[0].id;
      const updatedMenu: ContextMenu = {
        ...baseState.menus[0],
        title: 'Updated Title',
      };

      const result = addTo<ContextMenu, 'menus'>(baseState, updatedMenu, 'menus', m => m.id === existingId);
      expect(result.menus).toHaveLength(baseState.menus.length);
      expect(result.menus[0].title).toBe('Updated Title');
    });
  });

  describe('removeFrom', () => {
    it('should filter items by predicate', () => {
      const idToRemove = baseState.menus[0].id;
      const result = removeFrom<ContextMenu, 'menus'>(baseState, 'menus', m => m.id !== idToRemove);
      expect(result.menus).toHaveLength(baseState.menus.length - 1);
      expect(result.menus.find(m => m.id === idToRemove)).toBeUndefined();
    });

    it('should keep all items when predicate matches everything', () => {
      const result = removeFrom<ContextMenu, 'menus'>(baseState, 'menus', () => true);
      expect(result.menus).toHaveLength(baseState.menus.length);
    });
  });

  describe('syncConnectionReducer', () => {
    it('should save with otp_code cleared when rememberMe is true', () => {
      const payload: Partial<ConnectionSettings> = { rememberMe: true, username: 'myuser' };
      const result = syncConnectionReducer(baseState, makeAction(payload));

      expect(result.connection.username).toBe('myuser');
      expect(result.connection.rememberMe).toBe(true);

      // saveSettings should have been called with otp_code cleared
      const savedSettings = vi.mocked(localSet).mock.calls[0][1];
      expect(savedSettings).toHaveProperty('connection.otp_code', '');
    });

    it('should save with defaultConnection (except rememberMe) when rememberMe is false', () => {
      const payload: Partial<ConnectionSettings> = { rememberMe: false };
      const result = syncConnectionReducer(baseState, makeAction(payload));

      // The returned state merges the payload into connection
      expect(result.connection.rememberMe).toBe(false);

      // saveSettings should have been called with defaultConnection + rememberMe: false
      const savedSettings = vi.mocked(localSet).mock.calls[0][1];
      expect(savedSettings).toHaveProperty('connection.rememberMe', false);
    });
  });

  describe('syncInterceptReducer', () => {
    it('should set intercept on downloads', () => {
      const intercept: DownloadsIntercept = {
        enabled: true,
        erase: false,
        resume: true,
        modal: true,
        all: true,
        extensions: [],
        active: [],
      };

      const result = syncInterceptReducer(baseState, makeAction(intercept));
      expect(result.downloads.intercept).toEqual(intercept);
      expect(localSet).toHaveBeenCalled();
    });

    it('should fallback to default intercept when payload is null', () => {
      const result = syncInterceptReducer(baseState, makeAction(null as unknown as DownloadsIntercept));
      expect(result.downloads.intercept).toEqual(defaultDownloads.intercept);
    });
  });

  describe('syncAdvancedLoggingReducer', () => {
    it('should set logging on advanced', () => {
      const logging: Partial<AdvancedLogging> = { enabled: false, history: true };
      const result = syncAdvancedLoggingReducer(baseState, makeAction(logging));
      expect(result.advanced.logging).toEqual(logging);
      expect(localSet).toHaveBeenCalled();
    });

    it('should fallback to defaultAdvancedLogging when payload is null', () => {
      const result = syncAdvancedLoggingReducer(baseState, makeAction(null as unknown as Partial<AdvancedLogging>));
      expect(result.advanced.logging).toEqual(expect.objectContaining({ enabled: true }));
    });
  });

  describe('setBadgeReducer', () => {
    it('should call setBadgeBackgroundColor when color changes', () => {
      const payload: Partial<NotificationSettings> = {
        count: { ...baseState.notifications.count, color: '#ff0000' },
      };
      setBadgeReducer(baseState, makeAction(payload));
      expect(setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#ff0000' });
    });

    it('should not call setBadgeBackgroundColor when color is the same', () => {
      const payload: Partial<NotificationSettings> = {
        count: { ...baseState.notifications.count, color: baseState.notifications.count.color },
      };
      setBadgeReducer(baseState, makeAction(payload));
      expect(setBadgeBackgroundColor).not.toHaveBeenCalled();
    });

    it('should sync notifications settings', () => {
      const payload: Partial<NotificationSettings> = {
        count: { ...baseState.notifications.count, color: '#00ff00' },
      };
      const result = setBadgeReducer(baseState, makeAction(payload));
      expect(result.notifications.count.color).toBe('#00ff00');
      expect(localSet).toHaveBeenCalled();
    });
  });

  describe('setSyncSettingsReducer', () => {
    it('should merge sync settings and save', () => {
      const sync: Partial<SyncSettings> = { mode: SyncSettingMode.sync };
      const result = setSyncSettingsReducer(baseState, makeAction(sync)) as SettingsSlice;
      expect(result.sync.mode).toBe(SyncSettingMode.sync);
      // Now in sync mode, both syncSet and localSet should be called
      expect(syncSet).toHaveBeenCalled();
      expect(localSet).toHaveBeenCalled();
    });

    it('should preserve existing sync fields when partially updating', () => {
      baseState.sync.mode = SyncSettingMode.sync;
      const result = setSyncSettingsReducer(baseState, makeAction({})) as SettingsSlice;
      expect(result.sync.mode).toBe(SyncSettingMode.sync);
    });
  });

  describe('syncInterfaceReducer', () => {
    it('should call setPanelBehavior when panel.enabled is defined', () => {
      const payload: Partial<GlobalSettings> = { panel: { enabled: true } };
      const result = syncInterfaceReducer(baseState, makeAction(payload)) as SettingsSlice;
      expect(result.global.panel.enabled).toBe(true);
      expect((chrome.sidePanel as Record<string, unknown>).setPanelBehavior).toHaveBeenCalledWith({ openPanelOnActionClick: true });
    });

    it('should not call setPanelBehavior when panel.enabled is not in payload', () => {
      const payload: Partial<GlobalSettings> = { theme: 'dark' as GlobalSettings['theme'] };
      syncInterfaceReducer(baseState, makeAction(payload));
      expect((chrome.sidePanel as Record<string, unknown>).setPanelBehavior).not.toHaveBeenCalled();
    });

    it('should sync global settings', () => {
      const payload: Partial<GlobalSettings> = { panel: { enabled: false } };
      syncInterfaceReducer(baseState, makeAction(payload));
      expect(localSet).toHaveBeenCalled();
    });
  });

  describe('saveSettings', () => {
    it('should only call localSet in local mode', () => {
      saveSettings(baseState);
      expect(localSet).toHaveBeenCalled();
      expect(syncSet).not.toHaveBeenCalled();
    });

    it('should call both syncSet and localSet in sync mode', () => {
      baseState.sync.mode = SyncSettingMode.sync;
      saveSettings(baseState);
      expect(syncSet).toHaveBeenCalled();
      expect(localSet).toHaveBeenCalled();
    });
  });
});
