/// <reference types="chrome" />
import type { ContextMenu } from '../../../../models/menu.model';

import { act, fireEvent, waitFor } from '@testing-library/react';
import { of } from 'rxjs';

import { defaultContextMenu } from '../../../../models/menu.model';
import { ChromeMessageType } from '../../../../models/message.model';
import { defaultSettings } from '../../../../models/settings.model';
import { SynologyFileService } from '../../../../services/http/synology-file.service';
import { setSettings } from '../../../../store/actions/settings.action';
import { restoreState } from '../../../../store/actions/state.action';
import { store } from '../../../../store/store';
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsContextMenu } from './settings-context-menu';
import { SettingsContextMenus } from './settings-context-menus';

const menu: ContextMenu = { ...defaultContextMenu, id: 'destination-menu', modal: false };

beforeEach(() => {
  vi.restoreAllMocks();
  store.dispatch(restoreState({ logged: true }));
  vi.spyOn(SynologyFileService.prototype, 'listFolder').mockReturnValue(of({ total: 0, offset: 0, shares: [] }));
  vi.spyOn(SynologyFileService.prototype, 'listFile').mockReturnValue(of({ total: 0, offset: 0, files: [] }));
  vi.spyOn(chrome.runtime, 'sendMessage').mockImplementation((...parameters: unknown[]) => {
    const callback = parameters.at(-1) as (response: unknown) => void;
    callback({ success: true });
  });
});
afterEach(() => vi.restoreAllMocks());

describe('context-menu destination editor', () => {
  it.each([
    { destination: { custom: false }, custom: false, lastUsed: false },
    { destination: { custom: true, path: 'downloads/fixed' }, custom: true, lastUsed: false },
    { destination: { custom: false, lastUsed: true }, custom: false, lastUsed: true },
    { destination: { custom: true, lastUsed: true, path: 'downloads/fixed' }, custom: false, lastUsed: true },
  ])('restores saved folder switches: custom=$custom, lastUsed=$lastUsed', ({ destination, custom, lastUsed }) => {
    expect.assertions(2);
    const { getByRole } = renderWithProviders(<SettingsContextMenu menu={{ ...menu, destination }} onRemove={async () => {}} />);
    expect((getByRole('switch', { name: 'panel__settings__context_menu__destination_title' }) as HTMLInputElement).checked).toBe(custom);
    expect((getByRole('switch', { name: 'panel__settings__context_menu__last_used_title' }) as HTMLInputElement).checked).toBe(lastUsed);
  });

  it.each([
    { initial: { custom: false, lastUsed: false }, toggle: 'last_used', expected: { custom: false, lastUsed: true, path: 'downloads/fixed' } },
    { initial: { custom: false, lastUsed: false }, toggle: 'destination', expected: { custom: true, lastUsed: false, path: 'downloads/fixed' } },
    { initial: { custom: true, lastUsed: false }, toggle: 'last_used', expected: { custom: false, lastUsed: true, path: 'downloads/fixed' } },
    { initial: { custom: false, lastUsed: true }, toggle: 'destination', expected: { custom: true, lastUsed: false, path: 'downloads/fixed' } },
    { initial: { custom: true, lastUsed: false }, toggle: 'destination', expected: { custom: false, lastUsed: false, path: 'downloads/fixed' } },
    { initial: { custom: false, lastUsed: true }, toggle: 'last_used', expected: { custom: false, lastUsed: false, path: 'downloads/fixed' } },
  ])('persists exclusive switches when toggling $toggle from $initial', async ({ initial, toggle, expected }) => {
    expect.assertions(9);
    const savedMenu = { ...menu, destination: { ...initial, path: 'downloads/fixed' } };
    store.dispatch(setSettings({ ...defaultSettings, menus: [savedMenu] }));
    const { getByRole } = renderWithProviders(<SettingsContextMenu menu={savedMenu} onRemove={async () => {}} />);
    const customFolder = getByRole('switch', { name: 'panel__settings__context_menu__destination_title' }) as HTMLInputElement;
    const lastUsedFolder = getByRole('switch', { name: 'panel__settings__context_menu__last_used_title' }) as HTMLInputElement;
    expect(customFolder.checked).toBe(initial.custom);
    expect(lastUsedFolder.checked).toBe(initial.lastUsed);
    await act(async () => {
      fireEvent.click(getByRole('switch', { name: `panel__settings__context_menu__${toggle}_title` }));
    });
    expect(customFolder.checked).toBe(expected.custom);
    expect(lastUsedFolder.checked).toBe(expected.lastUsed);
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'common__buttons__save' }));
    });
    const request = vi.mocked(chrome.runtime.sendMessage).mock.calls.at(-1)?.[0] as unknown as { type: ChromeMessageType; payload: ContextMenu };
    expect(request.type).toBe(ChromeMessageType.updateMenu);
    expect(request.payload.destination).toEqual(expected);
    expect(store.getState().settings.menus[0].destination).toEqual(expected);
    const localPayload = vi.mocked(chrome.storage.local.set).mock.calls.at(-1)?.[0] as { settings: string };
    expect((JSON.parse(localPayload.settings) as { menus: ContextMenu[] }).menus[0].destination).toEqual(expected);
    const syncedPayload = vi.mocked(chrome.storage.sync.set).mock.calls.at(-1)?.[0] as { settings: string };
    expect((JSON.parse(syncedPayload.settings) as { menus: ContextMenu[] }).menus[0].destination).toEqual(expected);
  });

  it('shows the custom folder explorer only while its switch is on across repeated changes', async () => {
    expect.assertions(7);
    const { getByRole, queryByRole } = renderWithProviders(<SettingsContextMenu menu={{ ...menu, destination: { custom: true, path: 'downloads/fixed' } }} onRemove={async () => {}} />);
    const customFolder = getByRole('switch', { name: 'panel__settings__context_menu__destination_title' }) as HTMLInputElement;
    const lastUsedFolder = getByRole('switch', { name: 'panel__settings__context_menu__last_used_title' }) as HTMLInputElement;
    expect(getByRole('tree', { name: 'file system navigator' })).toBeTruthy();
    await act(async () => {
      fireEvent.click(lastUsedFolder);
    });
    await waitFor(() => {
      if (queryByRole('tree')) throw new Error('Custom folder explorer is still visible');
    });
    expect(queryByRole('tree')).toBeNull();
    expect(customFolder.checked).toBe(false);
    await act(async () => {
      fireEvent.click(customFolder);
    });
    expect(getByRole('tree', { name: 'file system navigator' })).toBeTruthy();
    expect(lastUsedFolder.checked).toBe(false);
    await act(async () => {
      fireEvent.click(customFolder);
    });
    await waitFor(() => {
      if (queryByRole('tree')) throw new Error('Custom folder explorer is still visible');
    });
    expect(queryByRole('tree')).toBeNull();
    expect([customFolder.checked, lastUsedFolder.checked]).toEqual([false, false]);
  });

  it.each([
    { destination: { custom: false, lastUsed: false, path: 'downloads/fixed' }, label: 'panel__settings__context_menus__default_folder' },
    { destination: { custom: true, path: 'downloads/fixed' }, label: 'downloads / fixed' },
    { destination: { custom: false, lastUsed: true, path: 'downloads/fixed' }, label: 'panel__settings__context_menus__last_used_folder' },
    { destination: { custom: true, path: '' }, label: 'panel__settings__context_menus__default_folder' },
  ])('labels the saved destination as $label', ({ destination, label }) => {
    expect.assertions(1);
    store.dispatch(setSettings({ ...defaultSettings, menus: [{ ...menu, destination }] }));
    const { getByText } = renderWithProviders(<SettingsContextMenus />);
    expect(getByText(label)).toBeTruthy();
  });
});
