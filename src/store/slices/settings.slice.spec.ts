/* eslint-disable ts/no-unsafe-argument */
import type { ContextMenu, QuickMenu } from '../../models/menu.model';
import type { ContentTab } from '../../models/tab.model';

import { describe, expect, it, vi } from 'vitest';

import { defaultSettings } from '../../models/settings.model';
import { settingsSlice } from './settings.slice';

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

const {
  setSettings,
  syncSettings,
  resetSettings,
  saveContextMenu,
  removeContextMenu,
  setContextMenus,
  saveContentTab,
  removeContentTab,
  saveQuickMenu,
  removeQuickMenu,
  syncPolling,
  syncDownloads,
  syncNotifications,
} = settingsSlice.actions;

const reducer = settingsSlice.reducer;

describe('settingsSlice', () => {
  it('setSettings should merge partial payload', () => {
    const state = reducer(defaultSettings, setSettings({ polling: { enabled: true } } as any));
    expect(state.polling.enabled).toBe(true);
  });

  it('syncSettings should merge partial payload', () => {
    const state = reducer(defaultSettings, syncSettings({ polling: { enabled: true } } as any));
    expect(state.polling.enabled).toBe(true);
  });

  it('resetSettings should return defaultSettings', () => {
    const modified = { ...defaultSettings, polling: { ...defaultSettings.polling, enabled: !defaultSettings.polling.enabled } };
    const state = reducer(modified, resetSettings());
    expect(state).toEqual(defaultSettings);
  });

  describe('context menus', () => {
    it('saveContextMenu should add a new menu', () => {
      const menu = { id: 'menu-1', title: 'Test' } as ContextMenu;
      const state = reducer(defaultSettings, saveContextMenu(menu));
      expect(state.menus).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'menu-1' })]));
    });

    it('saveContextMenu should replace existing menu by id', () => {
      const menu1 = { id: 'menu-1', title: 'Original' } as ContextMenu;
      const menu2 = { id: 'menu-1', title: 'Updated' } as ContextMenu;
      let state = reducer(defaultSettings, saveContextMenu(menu1));
      state = reducer(state, saveContextMenu(menu2));
      const matches = state.menus.filter(m => m.id === 'menu-1');
      expect(matches).toHaveLength(1);
      expect(matches[0].title).toBe('Updated');
    });

    it('removeContextMenu should remove by id', () => {
      const menu = { id: 'menu-1', title: 'Test' } as ContextMenu;
      let state = reducer(defaultSettings, saveContextMenu(menu));
      state = reducer(state, removeContextMenu('menu-1'));
      expect(state.menus.find(m => m.id === 'menu-1')).toBeUndefined();
    });

    it('removeContextMenu should return undefined for empty menus', () => {
      const state = reducer({ ...defaultSettings, menus: [] }, removeContextMenu('nonexistent'));
      expect(state.menus).toEqual([]);
    });

    it('setContextMenus should set entire menus array', () => {
      const menus = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }] as ContextMenu[];
      const state = reducer(defaultSettings, setContextMenus(menus));
      expect(state.menus).toEqual(menus);
    });
  });

  describe('content tabs', () => {
    it('saveContentTab should add a new tab', () => {
      const tab = { id: 'tab-1', title: 'Test' } as unknown as ContentTab;
      const state = reducer(defaultSettings, saveContentTab(tab));
      expect(state.tabs).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'tab-1' })]));
    });

    it('saveContentTab should replace existing tab by id', () => {
      const tab1 = { id: 'tab-1', title: 'Original' } as unknown as ContentTab;
      const tab2 = { id: 'tab-1', title: 'Updated' } as unknown as ContentTab;
      let state = reducer(defaultSettings, saveContentTab(tab1));
      state = reducer(state, saveContentTab(tab2));
      const matches = state.tabs.filter(t => t.id === 'tab-1');
      expect(matches).toHaveLength(1);
    });

    it('removeContentTab should remove tab by id', () => {
      const tab = { id: 'tab-1', title: 'Test' } as unknown as ContentTab;
      let state = reducer(defaultSettings, saveContentTab(tab));
      state = reducer(state, removeContentTab('tab-1'));
      expect(state.tabs.find(t => t.id === 'tab-1')).toBeUndefined();
    });
  });

  describe('quick menus', () => {
    it('saveQuickMenu should add a new quick menu', () => {
      const menu = { id: 'qm-1', title: 'Test' } as unknown as QuickMenu;
      const state = reducer(defaultSettings, saveQuickMenu(menu));
      expect(state.quick).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'qm-1' })]));
    });

    it('saveQuickMenu should replace existing by id', () => {
      const menu1 = { id: 'qm-1', title: 'Original' } as unknown as QuickMenu;
      const menu2 = { id: 'qm-1', title: 'Updated' } as unknown as QuickMenu;
      let state = reducer(defaultSettings, saveQuickMenu(menu1));
      state = reducer(state, saveQuickMenu(menu2));
      const matches = state.quick.filter(q => q.id === 'qm-1');
      expect(matches).toHaveLength(1);
    });

    it('removeQuickMenu should remove by id', () => {
      const menu = { id: 'qm-1', title: 'Test' } as unknown as QuickMenu;
      let state = reducer(defaultSettings, saveQuickMenu(menu));
      state = reducer(state, removeQuickMenu('qm-1'));
      expect(state.quick.find(q => q.id === 'qm-1')).toBeUndefined();
    });
  });

  it('syncPolling should merge polling settings', () => {
    const state = reducer(defaultSettings, syncPolling({ enabled: true }));
    expect(state.polling.enabled).toBe(true);
  });

  it('syncDownloads should merge download settings', () => {
    const state = reducer(defaultSettings, syncDownloads({ enabled: true }));
    expect(state.downloads.enabled).toBe(true);
  });

  it('syncNotifications should merge notification settings', () => {
    const state = reducer(defaultSettings, syncNotifications({ enabled: true }));
    expect(state.notifications.enabled).toBe(true);
  });
});
