/// <reference types="chrome" />
import type { ContentInterceptions, ContentSettings } from '../../../../models/settings.model';

import { act, fireEvent } from '@testing-library/react';

import { defaultContentSettings, defaultSettings } from '../../../../models/settings.model';
import { setSettings } from '../../../../store/actions/settings.action';
import { store } from '../../../../store/store';
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsQuickMenus } from './settings-quick-menus';

const defaults: ContentInterceptions = { magnet: true, thunder: true, flashget: true, qqdl: true, ed2k: true, torrent: false, nzb: false };
const choices = [
  { type: 'magnet', label: 'magnet:' },
  { type: 'thunder', label: 'thunder:' },
  { type: 'flashget', label: 'flashget:' },
  { type: 'qqdl', label: 'qqdl:' },
  { type: 'ed2k', label: 'ed2k:' },
  { type: 'torrent', label: '.torrent' },
  { type: 'nzb', label: '.nzb' },
] as const;

beforeEach(() => {
  vi.mocked(chrome.storage.local.set).mockClear();
  vi.mocked(chrome.storage.sync.set).mockClear();
});

describe('per-type link interception settings', () => {
  it('keeps existing protocol defaults and opts new file extensions out', () => {
    expect.assertions(1);
    expect(defaultContentSettings.interceptions).toEqual(defaults);
  });

  it('renders legacy settings with the supported defaults', () => {
    expect.assertions(8);
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true } }));
    const { getByRole } = renderWithProviders(<SettingsQuickMenus />);
    for (const choice of choices) {
      const checkbox = getByRole('checkbox', { name: choice.label, exact: true }) as HTMLInputElement;
      expect(checkbox.checked).toBe(defaults[choice.type]);
    }
    expect(store.getState().settings.content.intercept).toBe(true);
  });

  it.each(choices)('persists $type without changing the other choices', async ({ type, label }) => {
    expect.assertions(6);
    const interceptions = { ...defaults, magnet: false, nzb: true };
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true, interceptions } }));
    const { getByRole } = renderWithProviders(<SettingsQuickMenus />);
    const checkbox = getByRole('checkbox', { name: label, exact: true }) as HTMLInputElement;
    expect(checkbox.checked).toBe(interceptions[type]);
    await act(async () => {
      fireEvent.click(checkbox);
    });
    const expected = { intercept: true, interceptions: { ...interceptions, [type]: !interceptions[type] } };
    expect(checkbox.checked).toBe(!interceptions[type]);
    expect(store.getState().settings.content).toEqual(expected);
    expect(store.getState().settings.content.intercept).toBe(true);
    const localPayload = vi.mocked(chrome.storage.local.set).mock.calls.at(-1)?.[0] as { settings: string };
    expect((JSON.parse(localPayload.settings) as { content: ContentSettings }).content).toEqual(expected);
    const syncedPayload = vi.mocked(chrome.storage.sync.set).mock.calls.at(-1)?.[0] as { settings: string };
    expect((JSON.parse(syncedPayload.settings) as { content: ContentSettings }).content).toEqual(expected);
  });

  it('fills missing saved choices without overwriting explicit opt-outs', () => {
    expect.assertions(7);
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true, interceptions: { magnet: false, torrent: true } } }));
    const { getByRole } = renderWithProviders(<SettingsQuickMenus />);
    const expected = { ...defaults, magnet: false, torrent: true };
    for (const choice of choices) {
      expect((getByRole('checkbox', { name: choice.label, exact: true }) as HTMLInputElement).checked).toBe(expected[choice.type]);
    }
  });

  it('disables individual controls through the master switch without losing preferences', async () => {
    expect.assertions(3);
    const interceptions = { ...defaults, magnet: false, torrent: true };
    store.dispatch(setSettings({ ...defaultSettings, content: { intercept: true, interceptions } }));
    const { getByRole, getAllByRole } = renderWithProviders(<SettingsQuickMenus />);
    await act(async () => {
      fireEvent.click(getByRole('switch'));
    });
    expect(store.getState().settings.content.intercept).toBe(false);
    expect(store.getState().settings.content.interceptions).toEqual(interceptions);
    expect(getAllByRole('checkbox').every(checkbox => (checkbox as HTMLInputElement).disabled)).toBe(true);
  });
});
