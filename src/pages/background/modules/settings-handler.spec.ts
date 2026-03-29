/* eslint-disable ts/no-unsafe-assignment, ts/no-unsafe-argument */
import type { SettingsSlice, StoreOrProxy } from '../../../models/store.model';

import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SyncSettingMode } from '../../../models/settings.model';
import { setNavbar } from '../../../store/actions/navbar.action';
import { setSettings } from '../../../store/actions/settings.action';
import { buildContextMenu } from '../../../utils/chrome/chrome-context.utils';
import { setBadgeBackgroundColor } from '../../../utils/chrome/chrome.utils';
import { localGet, syncGet } from '../../../utils/webex.utils';
import { restoreSettings } from './settings-handler';

vi.mock('../../../utils/webex.utils', () => ({
  localGet: vi.fn(),
  syncGet: vi.fn(),
  localSet: vi.fn(() => of({})),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  ProxyLogger: class {
    debug = vi.fn();
  },
  getManifest: vi.fn(() => ({ version: '2.0.3' })),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../store/actions/settings.action', () => ({
  setSettings: vi.fn((v: unknown) => ({ type: 'SET_SETTINGS', payload: v })),
}));

vi.mock('../../../store/actions/navbar.action', () => ({
  setNavbar: vi.fn((v: unknown) => ({ type: 'SET_NAVBAR', payload: v })),
}));

vi.mock('../../../store/slices/settings.slice', () => ({
  settingsSlice: { name: 'settings' },
}));

vi.mock('../../../utils/chrome/chrome-context.utils', () => ({
  buildContextMenu: vi.fn(async () => Promise.resolve()),
}));

vi.mock('../../../utils/chrome/chrome.utils', () => ({
  setBadgeBackgroundColor: vi.fn(async () => Promise.resolve()),
  setBadgeText: vi.fn(),
  setTitle: vi.fn(),
  setIcon: vi.fn(),
}));

vi.mock('../../../models/settings.model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../models/settings.model')>();
  return {
    ...actual,
    defaultSettings: { menus: [{ id: 'default' }] },
  };
});

describe('settings-handler', () => {
  let store: StoreOrProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(),
      replaceReducer: vi.fn(),
      [Symbol.observable]: vi.fn(),
    } as unknown as StoreOrProxy;
  });

  it('should restore settings from sync storage by default', async () => {
    const settings: Partial<SettingsSlice> = {
      sync: { mode: SyncSettingMode.sync } as any,
      menus: [{ id: 'menu-1' }] as any,
    };

    vi.mocked(localGet).mockReturnValue(of(settings) as any);
    vi.mocked(syncGet).mockReturnValue(of(settings) as any);

    await firstValueFrom(restoreSettings(store));

    expect(setSettings).toHaveBeenCalledWith(settings);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('should use local storage when sync mode is local', async () => {
    const settings: Partial<SettingsSlice> = {
      sync: { mode: SyncSettingMode.local } as any,
      menus: [{ id: 'menu-1' }] as any,
    };

    vi.mocked(localGet).mockReturnValue(of(settings) as any);

    await firstValueFrom(restoreSettings(store));

    expect(syncGet).not.toHaveBeenCalled();
    expect(setSettings).toHaveBeenCalledWith(settings);
  });

  it('should restore badge color when present in settings', async () => {
    const settings: Partial<SettingsSlice> = {
      sync: { mode: SyncSettingMode.local } as any,
      notifications: { count: { color: '#ff0000' } } as any,
      menus: [],
    };

    vi.mocked(localGet).mockReturnValue(of(settings) as any);

    await firstValueFrom(restoreSettings(store));

    expect(setBadgeBackgroundColor).toHaveBeenCalledWith({ color: '#ff0000' });
  });

  it('should restore navbar tab when tabs are present', async () => {
    const settings: Partial<SettingsSlice> = {
      sync: { mode: SyncSettingMode.local } as any,
      tabs: ['downloads-tab'] as any,
      menus: [],
    };

    vi.mocked(localGet).mockReturnValue(of(settings) as any);

    await firstValueFrom(restoreSettings(store));

    expect(setNavbar).toHaveBeenCalledWith('downloads-tab');
  });

  it('should build context menu with settings menus', async () => {
    const settings: Partial<SettingsSlice> = {
      sync: { mode: SyncSettingMode.local } as any,
      menus: [{ id: 'ctx-1' }] as any,
      scrape: { menu: true } as any,
    };

    vi.mocked(localGet).mockReturnValue(of(settings) as any);

    await firstValueFrom(restoreSettings(store));

    expect(buildContextMenu).toHaveBeenCalledWith({ menus: [{ id: 'ctx-1' }], scrape: true });
  });

  it('should catch errors and return null', async () => {
    vi.mocked(localGet).mockReturnValue(throwError(() => new Error('storage error')) as any);

    const result = await firstValueFrom(restoreSettings(store));
    expect(result).toBeNull();
  });
});
