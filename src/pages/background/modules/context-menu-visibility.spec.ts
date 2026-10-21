/// <reference types="chrome" />
import type { Subscription } from 'rxjs';

import type { ContextMenu } from '../../../models/menu.model';

import { defaultContextMenu } from '../../../models/menu.model';
import { defaultSettings } from '../../../models/settings.model';
import { setSettings } from '../../../store/actions/settings.action';
import { restoreState } from '../../../store/actions/state.action';
import { store } from '../../../store/store';
import { watchContextMenuVisibility } from './context-menu-visibility';

const recentMenu: ContextMenu = { ...defaultContextMenu, id: 'recent', destination: { custom: false, lastUsed: true } };
const ordinaryMenu: ContextMenu = { ...defaultContextMenu, id: 'ordinary' };
let subscription: Subscription | undefined;

function setMenus(menus: ContextMenu[], scrape = true) {
  store.dispatch(setSettings({ ...defaultSettings, menus, scrape: { menu: scrape } }));
}
function setHistory(destinations: string[]) {
  store.dispatch(restoreState({ history: { destinations, folders: [], logs: [] } }));
}

beforeEach(() => {
  vi.mocked(chrome.contextMenus.update).mockReset();
  vi.mocked(chrome.contextMenus.update).mockImplementation(async (_id, _properties, callback) => {
    callback?.();
    return Promise.resolve();
  });
  setHistory([]);
});
afterEach(() => subscription?.unsubscribe());

describe('last-used native menu visibility', () => {
  it.each([
    { menus: [recentMenu, ordinaryMenu], destinations: [], visible: false },
    { menus: [recentMenu, ordinaryMenu], destinations: ['downloads/recent'], visible: true },
    { menus: [recentMenu], destinations: [], visible: true },
    { menus: [recentMenu, { ...recentMenu, id: 'second-recent' }], destinations: [], visible: true },
  ])('uses history and remaining download actions: $visible', ({ menus, destinations, visible }) => {
    expect.assertions(2);
    setMenus(menus);
    setHistory(destinations);
    subscription = watchContextMenuVisibility(store);
    expect(chrome.contextMenus.update).toHaveBeenCalledWith('recent', { visible }, expect.any(Function));
    expect(vi.mocked(chrome.contextMenus.update).mock.calls.some(([id]) => id === ordinaryMenu.id)).toBe(false);
  });

  it('ignores Scrape Page when deciding the sole-action fallback', () => {
    expect.assertions(1);
    setMenus([recentMenu], true);
    subscription = watchContextMenuVisibility(store);
    expect(chrome.contextMenus.update).toHaveBeenCalledExactlyOnceWith('recent', { visible: true }, expect.any(Function));
  });

  it('reacts to restored, added and cleared history', () => {
    expect.assertions(2);
    setMenus([recentMenu, ordinaryMenu]);
    subscription = watchContextMenuVisibility(store);
    setHistory(['downloads/restored']);
    setHistory(['downloads/newest', 'downloads/restored']);
    setHistory([]);
    expect(vi.mocked(chrome.contextMenus.update).mock.calls.map(([, properties]) => properties.visible)).toEqual([false, true, false]);
    expect(store.getState().settings.menus).toEqual([recentMenu, ordinaryMenu]);
  });

  it('refreshes visibility after menu configuration changes', () => {
    expect.assertions(1);
    setMenus([recentMenu]);
    subscription = watchContextMenuVisibility(store);
    setMenus([recentMenu, ordinaryMenu]);
    setMenus([recentMenu]);
    expect(vi.mocked(chrome.contextMenus.update).mock.calls.map(([, properties]) => properties.visible)).toEqual([true, false, true]);
  });

  it('does nothing for ordinary menus', () => {
    expect.assertions(1);
    setMenus([ordinaryMenu]);
    subscription = watchContextMenuVisibility(store);
    expect(chrome.contextMenus.update).not.toHaveBeenCalled();
  });

  it('replaces the previous watcher and stops after unsubscribe', () => {
    expect.assertions(2);
    setMenus([recentMenu, ordinaryMenu]);
    subscription = watchContextMenuVisibility(store);
    subscription = watchContextMenuVisibility(store);
    vi.mocked(chrome.contextMenus.update).mockClear();
    setHistory(['downloads/newest']);
    expect(chrome.contextMenus.update).toHaveBeenCalledOnce();
    subscription.unsubscribe();
    setHistory([]);
    expect(chrome.contextMenus.update).toHaveBeenCalledOnce();
  });
});
