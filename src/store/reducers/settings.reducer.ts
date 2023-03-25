import type {
  AdvancedLogging,
  AdvancedSettings,
  Connection,
  ContentTab,
  ContextMenu,
  Downloads,
  DownloadsIntercept,
  Notifications,
  QuickMenu,
  SettingsSlice,
  SyncSettings,
} from '@src/models';
import {
  defaultAdvancedLogging,
  defaultAdvancedSettings,
  defaultConnection,
  defaultDownloads,
  SettingsSliceName,
  SyncSettingMode,
} from '@src/models';
import { LoggerService } from '@src/services';
import { localSet, syncSet, setBadgeBackgroundColor } from '@src/utils';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

const localSettings = (settings: SettingsSlice): void => {
  // TODO : move to thunk ?
  localSet<SettingsSlice>(SettingsSliceName, settings).subscribe(() => LoggerService.debug('Setting chrome local success', settings));
};

const syncSettings = (settings: SettingsSlice): void => {
  // TODO : move to thunk ?
  syncSet<SettingsSlice>(SettingsSliceName, settings).subscribe(() => LoggerService.debug('Setting chrome sync success', settings));
};

export const saveSettings = (settings: SettingsSlice): void => {
  if (settings.sync.mode === SyncSettingMode.sync) syncSettings(settings);
  localSettings(settings);
};

export const setNestedReducer = <T>(oldSettings: SettingsSlice, payload: Partial<T>, name: keyof SettingsSlice): SettingsSlice => {
  return { ...oldSettings, [name]: { ...oldSettings[name], ...payload } };
};

export const syncNestedReducer = <T>(oldSettings: SettingsSlice, payload: Partial<T>, name: keyof SettingsSlice): SettingsSlice => {
  const newSettings = setNestedReducer(oldSettings, payload, name);
  saveSettings(newSettings);
  return newSettings;
};

export const syncInterceptReducer = (oldSettings: SettingsSlice, { payload }: PayloadAction<DownloadsIntercept>): SettingsSlice => {
  const newDownloads: Downloads = { ...(oldSettings.downloads ?? defaultDownloads), intercept: payload ?? defaultDownloads.intercept };
  const newSettings = setNestedReducer(oldSettings, newDownloads, 'downloads');
  syncNestedReducer<Downloads>(newSettings, newDownloads, 'downloads');
  return newSettings;
};

export const syncAdvancedLoggingReducer = (oldSettings: SettingsSlice, { payload }: PayloadAction<Partial<AdvancedLogging>>): SettingsSlice => {
  const newAdvanced: AdvancedSettings = { ...(oldSettings?.advanced ?? defaultAdvancedSettings), logging: payload ?? defaultAdvancedLogging };
  const newSettings = setNestedReducer(oldSettings, newAdvanced, 'advanced');
  syncNestedReducer<AdvancedSettings>(newSettings, newAdvanced, 'advanced');
  return newSettings;
};

export const setBadgeReducer = <T extends Notifications>(oldSettings: SettingsSlice, { payload }: PayloadAction<Partial<T>>): SettingsSlice => {
  const color = payload?.count?.color;
  // TODO : move to thunk ?
  if (color !== oldSettings?.notifications?.count?.color) {
    setBadgeBackgroundColor({ color: color ?? '' }).then(() => LoggerService.debug('Badge color changed to ', color));
  }
  return syncNestedReducer<T>(oldSettings, payload, 'notifications');
};

export const setReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => ({
  ...oldSettings,
  ...action?.payload,
});

export const syncReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => {
  const newSettings = setReducer(oldSettings, action);
  saveSettings(newSettings);
  return newSettings;
};

export const syncConnectionReducer = (oldSettings: SettingsSlice, { payload }: PayloadAction<Partial<Connection>>): SettingsSlice => {
  const newSettings = setNestedReducer(oldSettings, payload, 'connection');
  saveSettings(
    payload?.rememberMe
      ? { ...newSettings, connection: { ...newSettings.connection, otp_code: '' } }
      : { ...newSettings, connection: { ...defaultConnection, rememberMe: payload?.rememberMe } },
  );
  return newSettings;
};

type Payloads = ContentTab | ContextMenu | QuickMenu;
type Keys = 'tabs' | 'menus' | 'quick';

const syncPayload = <P extends Payloads, K extends Keys>(oldSettings: SettingsSlice, key: K, filter: (array: P[]) => P[]): SettingsSlice => {
  return syncReducer(oldSettings, {
    type: 'sync',
    payload: { ...oldSettings, [key]: filter(oldSettings[key] as P[]) },
  });
};

export const addTo = <P extends Payloads, K extends Keys>(
  oldSettings: SettingsSlice,
  payload: P,
  key: K,
  filter: (obj: P) => boolean,
): SettingsSlice => {
  return syncPayload<P, K>(oldSettings, key, array => {
    const index = array?.findIndex(filter);
    if (index > -1) {
      const _array = [...array];
      _array.splice(index, 1, payload);
      return _array;
    }
    return [...array, payload];
  });
};
export const removeFrom = <P extends Payloads, K extends Keys>(oldSettings: SettingsSlice, key: K, filter: (obj: P) => boolean): SettingsSlice => {
  return syncPayload<P, K>(oldSettings, key, array => array?.filter(filter));
};

export const setSyncSettingsReducer: CaseReducer<SettingsSlice, PayloadAction<Partial<SyncSettings>>> = (state, { payload: sync }) => {
  const newState = { ...state, sync: { ...state.sync, ...sync } };
  saveSettings(newState);
  return newState;
};
