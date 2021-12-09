import { SettingsSlice } from '../../models';
import { PayloadAction } from '@reduxjs/toolkit';
import { settingsSlice } from '../slices';

export const setReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => ({
  ...oldSettings,
  ...action?.payload,
});
export const syncReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => {
  const newSettings = setReducer(oldSettings, action);
  chrome.storage.sync.set({ [settingsSlice.name]: JSON.stringify(newSettings) }, () => {
    //TODO: notification setting saved
    console.debug('Setting sync success', newSettings);
  });
  return newSettings;
};

export const setNestedReducer = <T>(oldSettings: SettingsSlice, action: PayloadAction<Partial<T>>, name: keyof SettingsSlice): SettingsSlice => {
  return { ...oldSettings, [name]: { ...oldSettings[name], ...action?.payload } };
};

export const syncNestedReducer = <T>(oldSettings: SettingsSlice, action: PayloadAction<Partial<T>>, name: keyof SettingsSlice): SettingsSlice => {
  const newSettings = setNestedReducer(oldSettings, action, name);
  chrome.storage.sync.set({ settings: JSON.stringify(newSettings) }, () => {
    //TODO: notification setting saved
    console.debug('Setting sync success', newSettings);
  });
  return newSettings;
};

const syncPayload = <T>(oldSettings: SettingsSlice | any, key: string, filter: (array: T[]) => T[]): SettingsSlice => {
  return syncReducer(oldSettings, {
    type: 'sync',
    payload: { ...oldSettings, [key]: filter(oldSettings[key]) },
  });
};

export const addTo = <T>(oldSettings: SettingsSlice | any, action: PayloadAction<T>, key: string, filter: (obj: T) => boolean): SettingsSlice => {
  return syncPayload<T>(oldSettings, key, (array) => (array?.length ? [...array.filter(filter), action?.payload] : [action?.payload]));
};
export const removeFrom = <T, U>(
  oldSettings: SettingsSlice | any,
  action: PayloadAction<U>,
  key: string,
  filter: (obj: T) => boolean
): SettingsSlice => {
  return syncPayload<T>(oldSettings, key, (array) => array?.filter(filter));
};
