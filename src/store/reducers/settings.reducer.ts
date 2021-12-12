import { ContextMenuOption, SettingsSlice, TaskTab } from '../../models';
import { PayloadAction } from '@reduxjs/toolkit';
import { settingsSlice } from '../slices';
import { parseJSON } from '../../utils';

export const setReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => ({
  ...oldSettings,
  ...action?.payload,
});
export const syncReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => {
  const newSettings = setReducer(oldSettings, action);
  chrome.storage.sync.set({ [settingsSlice.name]: JSON.stringify(newSettings) }, () => console.debug('Setting sync success', newSettings));
  return newSettings;
};

export const setNestedReducer = <T>(oldSettings: SettingsSlice, action: PayloadAction<Partial<T>>, name: keyof SettingsSlice): SettingsSlice => {
  return { ...oldSettings, [name]: { ...oldSettings[name], ...action?.payload } };
};

export const syncNestedReducer = <T>(oldSettings: SettingsSlice, action: PayloadAction<Partial<T>>, name: keyof SettingsSlice): SettingsSlice => {
  const newSettings = setNestedReducer(oldSettings, action, name);
  chrome.storage.sync.set({ settings: JSON.stringify(newSettings) }, () => console.debug('Setting sync success', newSettings));
  return newSettings;
};

export const syncRememberMeReducer = (oldSettings: SettingsSlice, { payload: rememberMe }: PayloadAction<boolean>): SettingsSlice => {
  const setSettings = { ...oldSettings, connection: { ...oldSettings.connection, rememberMe } };
  chrome.storage.sync.get(settingsSlice.name, ({ settings }) => {
    const _settings = parseJSON<SettingsSlice>(settings);
    const syncedSettings = { ..._settings, connection: { ..._settings?.connection, rememberMe } };
    chrome.storage.sync.set({ settings: syncedSettings }, () => console.debug('Setting sync success', syncedSettings, setSettings));
  });

  return setSettings;
};

const syncPayload = <T extends TaskTab | ContextMenuOption>(
  oldSettings: SettingsSlice,
  key: 'tabs' | 'menus',
  filter: (array: T[]) => T[]
): SettingsSlice => {
  return syncReducer(oldSettings, {
    type: 'sync',
    payload: { ...oldSettings, [key]: filter(oldSettings[key] as T[]) },
  });
};

export const addTo = <T extends TaskTab | ContextMenuOption>(
  oldSettings: SettingsSlice,
  action: PayloadAction<T>,
  key: 'tabs' | 'menus',
  filter: (obj: T) => boolean
): SettingsSlice => {
  return syncPayload<T>(oldSettings, key, (array) => (array?.length ? [...array.filter(filter), action?.payload] : [action?.payload]));
};
export const removeFrom = <T extends TaskTab | ContextMenuOption, U>(
  oldSettings: SettingsSlice,
  action: PayloadAction<U>,
  key: 'tabs' | 'menus',
  filter: (obj: T) => boolean
): SettingsSlice => {
  return syncPayload<T>(oldSettings, key, (array) => array?.filter(filter));
};
