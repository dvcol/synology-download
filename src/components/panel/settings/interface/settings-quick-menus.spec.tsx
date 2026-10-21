/// <reference types="chrome" />
import type { ContentSettings } from '../../../../models/settings.model';

import { act, fireEvent } from '@testing-library/react';

import { defaultContentSettings, defaultSettings } from '../../../../models/settings.model';
import { setSettings } from '../../../../store/actions/settings.action';
import { store } from '../../../../store/store';
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsQuickMenus } from './settings-quick-menus';

beforeEach(() => {
  vi.mocked(chrome.storage.local.set).mockClear();
  vi.mocked(chrome.storage.sync.set).mockClear();
});

describe('file-link interception settings', () => {
  it('defaults file interception to disabled', () => {
    expect.assertions(1);
    expect(defaultContentSettings.interceptFiles).toBe(false);
  });

  it('renders legacy settings with file interception disabled', () => {
    expect.assertions(2);
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true } }));
    const { getByRole } = renderWithProviders(<SettingsQuickMenus />);
    const toggle = getByRole('checkbox', { name: 'panel__settings__quick_menus__files_title' }) as HTMLInputElement;
    expect(toggle.checked).toBe(false);
    expect(store.getState().settings.content.intercept).toBe(true);
  });

  it.each([
    { intercept: true, interceptFiles: false },
    { intercept: true, interceptFiles: true },
    { intercept: false, interceptFiles: false },
  ] satisfies ContentSettings[])('persists file opt-in independently: $intercept/$interceptFiles', async (content) => {
    expect.assertions(5);
    store.dispatch(setSettings({ ...defaultSettings, content }));
    const { getByRole } = renderWithProviders(<SettingsQuickMenus />);
    const toggle = getByRole('checkbox', { name: 'panel__settings__quick_menus__files_title' }) as HTMLInputElement;
    expect(toggle.checked).toBe(content.interceptFiles);
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(toggle.checked).toBe(!content.interceptFiles);
    expect(store.getState().settings.content).toEqual({ ...content, interceptFiles: !content.interceptFiles });
    const localPayload = vi.mocked(chrome.storage.local.set).mock.calls.at(-1)?.[0] as { settings: string };
    const localSettings = JSON.parse(localPayload.settings) as { content: ContentSettings };
    expect(localSettings.content).toEqual({ ...content, interceptFiles: !content.interceptFiles });
    const syncedPayload = vi.mocked(chrome.storage.sync.set).mock.calls.at(-1)?.[0] as { settings: string };
    const syncedSettings = JSON.parse(syncedPayload.settings) as { content: ContentSettings };
    expect(syncedSettings.content).toEqual({ ...content, interceptFiles: !content.interceptFiles });
  });
});
