import { syncGet, syncSet } from '@dvcol/web-extension-utils';

import type { Connection, ContextMenu, Notifications, QuickMenu, SettingsSlice, TaskTab } from '@src/models';
import { SettingsSliceName } from '@src/models';
import { setBadgeBackgroundColor } from '@src/utils';

import type { PayloadAction } from '@reduxjs/toolkit';

export const syncSettings = (settings: SettingsSlice): void => {
  // TODO : move to thunk ?
  syncSet<SettingsSlice>(SettingsSliceName, settings).subscribe(() => console.debug('Setting sync success', settings));
};

export const setNestedReducer = <T>(oldSettings: SettingsSlice, payload: Partial<T>, name: keyof SettingsSlice): SettingsSlice => {
  return { ...oldSettings, [name]: { ...oldSettings[name], ...payload } };
};

export const syncNestedReducer = <T>(oldSettings: SettingsSlice, payload: Partial<T>, name: keyof SettingsSlice): SettingsSlice => {
  const newSettings = setNestedReducer(oldSettings, payload, name);
  syncSettings(newSettings);
  return newSettings;
};

export const syncRememberMeReducer = (oldSettings: SettingsSlice, { payload: rememberMe }: PayloadAction<boolean>): SettingsSlice => {
  const setSettings = { ...oldSettings, connection: { ...oldSettings.connection, rememberMe } };
  // TODO : move to thunk ?
  syncGet<SettingsSlice>(SettingsSliceName).subscribe(settings => {
    const syncedSettings = { ...settings, connection: { ...settings?.connection, rememberMe } };
    syncSettings(syncedSettings);
  });

  return setSettings;
};

export const setBadgeReducer = <T extends Notifications>(oldSettings: SettingsSlice, { payload }: PayloadAction<Partial<T>>): SettingsSlice => {
  const color = payload?.count?.color;
  // TODO : move to thunk ?
  if (color !== oldSettings?.notifications?.count?.color) {
    setBadgeBackgroundColor({ color: color ?? '' }).then(() => console.debug('Badge color changed to ', color));
  }
  return syncNestedReducer<T>(oldSettings, payload, 'notifications');
};

export const setReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => ({
  ...oldSettings,
  ...action?.payload,
});

export const syncReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => {
  const newSettings = setReducer(oldSettings, action);
  syncSettings(newSettings);
  return newSettings;
};

export const syncConnectionReducer = (oldSettings: SettingsSlice, { payload }: PayloadAction<Partial<Connection>>): SettingsSlice => {
  if (payload.rememberMe) return syncNestedReducer<Connection>(oldSettings, payload, 'connection');
  return setNestedReducer<Connection>(oldSettings, payload, 'connection');
};

type Payloads = TaskTab | ContextMenu | QuickMenu;
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
