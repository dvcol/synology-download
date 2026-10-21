/// <reference types="chrome" />
import type { ContextMenu } from '../../../../models/menu.model';

import { act, fireEvent } from '@testing-library/react';
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
    { destination: { custom: false }, mode: 'default' },
    { destination: { custom: true, path: 'downloads/fixed' }, mode: 'custom' },
    { destination: { custom: false, lastUsed: true }, mode: 'last_used' },
  ])('restores the $mode mode from saved settings', ({ destination, mode }) => {
    expect.assertions(1);
    const { getByRole } = renderWithProviders(<SettingsContextMenu menu={{ ...menu, destination }} onRemove={async () => {}} />);
    expect(getByRole('button', { name: `panel__settings__context_menu__destination_${mode}` }).getAttribute('aria-pressed')).toBe('true');
  });

  it.each([
    { mode: 'last_used', expected: { custom: false, lastUsed: true, path: '' } },
    { mode: 'custom', expected: { custom: true, lastUsed: false, path: '' } },
    { mode: 'default', expected: { custom: false, lastUsed: false, path: '' } },
  ])('saves the mutually exclusive $mode destination and persists it', async ({ mode, expected }) => {
    expect.assertions(5);
    store.dispatch(setSettings({ ...defaultSettings, menus: [menu] }));
    const { getByRole } = renderWithProviders(<SettingsContextMenu menu={menu} onRemove={async () => {}} />);
    const choice = getByRole('button', { name: `panel__settings__context_menu__destination_${mode}` });
    await act(async () => {
      fireEvent.click(choice);
    });
    expect(choice.getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'common__buttons__save' }));
    });
    const request = vi.mocked(chrome.runtime.sendMessage).mock.calls.at(-1)?.[0] as unknown as { type: ChromeMessageType; payload: ContextMenu };
    expect(request.type).toBe(ChromeMessageType.updateMenu);
    expect(request.payload.destination).toEqual(expected);
    expect(store.getState().settings.menus[0].destination).toEqual(expected);
    const storagePayload = vi.mocked(chrome.storage.local.set).mock.calls.at(-1)?.[0] as { settings: string };
    const savedSettings = JSON.parse(storagePayload.settings) as { menus: ContextMenu[] };
    expect(savedSettings.menus[0].destination).toEqual(expected);
  });

  it('labels a last-used menu correctly in the settings summary', () => {
    expect.assertions(1);
    store.dispatch(setSettings({ ...defaultSettings, menus: [{ ...menu, destination: { custom: false, lastUsed: true } }] }));
    const { getByText } = renderWithProviders(<SettingsContextMenus />);
    expect(getByText('panel__settings__context_menus__last_used_folder')).toBeTruthy();
  });
});
