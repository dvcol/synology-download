import { createSlice } from '@reduxjs/toolkit';

import type { Connection, ContextMenu, Downloads, Global, Notifications, Polling, QuickMenu, SettingsSlice, TaskTab } from '@src/models';
import { defaultSettings, SettingsSliceName } from '@src/models';

import {
  addTo,
  removeFrom,
  setBadgeReducer,
  setReducer,
  syncConnectionReducer,
  syncNestedReducer,
  syncReducer,
  syncRememberMeReducer,
} from '../reducers/settings.reducer';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import type { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

interface SettingsReducers<S = SettingsSlice> extends SliceCaseReducers<S> {
  setSettings: CaseReducer<S, PayloadAction<S>>;
  syncSettings: CaseReducer<S, PayloadAction<Partial<S>>>;
  resetSettings: CaseReducer<S>;
  syncConnection: CaseReducer<S, PayloadAction<Partial<Connection>>>;
  syncRememberMe: CaseReducer<S, PayloadAction<boolean>>;
  syncPolling: CaseReducer<S, PayloadAction<Partial<Polling>>>;
  syncNotifications: CaseReducer<S, PayloadAction<Partial<Notifications>>>;
  saveContextMenu: CaseReducer<S, PayloadAction<ContextMenu>>;
  removeContextMenu: CaseReducer<S, PayloadAction<string>>;
  resetContextMenu: CaseReducer<S>;
  saveTaskTab: CaseReducer<S, PayloadAction<TaskTab>>;
  removeTaskTab: CaseReducer<S, PayloadAction<string>>;
  resetTaskTabs: CaseReducer<S>;
  saveQuickMenu: CaseReducer<S, PayloadAction<QuickMenu>>;
  removeQuickMenu: CaseReducer<S, PayloadAction<string>>;
  resetQuickMenus: CaseReducer<S>;
  syncInterface: CaseReducer<S, PayloadAction<Partial<Global>>>;
  syncDownloads: CaseReducer<S, PayloadAction<Partial<Downloads>>>;
}

export const settingsSlice = createSlice<SettingsSlice, SettingsReducers, 'settings'>({
  name: SettingsSliceName,
  initialState: defaultSettings,
  reducers: {
    setSettings: setReducer,
    syncSettings: syncReducer,
    resetSettings: oldSettings => syncReducer(oldSettings, { type: 'sync', payload: defaultSettings }),
    syncConnection: syncConnectionReducer,
    syncRememberMe: (oldSettings, action) => syncRememberMeReducer(oldSettings, action),
    syncPolling: (oldSettings, { payload }) => syncNestedReducer<Polling>(oldSettings, payload, 'polling'),
    syncNotifications: (oldSettings, action) => setBadgeReducer(oldSettings, action),
    saveContextMenu: (oldSettings, { payload }): SettingsSlice =>
      addTo<ContextMenu, 'menus'>(oldSettings, payload, 'menus', o => o.id === payload?.id),
    removeContextMenu: (oldSettings, { payload }): SettingsSlice | void => {
      if (oldSettings.menus?.length) {
        return removeFrom<ContextMenu, 'menus'>(oldSettings, 'menus', o => o.id !== payload);
      }
    },
    resetContextMenu: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { menus: defaultSettings.menus },
      }),
    saveTaskTab: (oldSettings, { payload }): SettingsSlice => addTo<TaskTab, 'tabs'>(oldSettings, payload, 'tabs', o => o.id === payload.id),
    removeTaskTab: (oldSettings, { payload }): SettingsSlice => removeFrom<TaskTab, 'tabs'>(oldSettings, 'tabs', o => o.id !== payload),
    resetTaskTabs: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs: defaultSettings.tabs },
      }),
    saveQuickMenu: (oldSettings, { payload }): SettingsSlice => addTo<QuickMenu, 'quick'>(oldSettings, payload, 'quick', o => o.id === payload?.id),
    removeQuickMenu: (oldSettings, { payload }): SettingsSlice => removeFrom<QuickMenu, 'quick'>(oldSettings, 'quick', o => o.id !== payload),
    resetQuickMenus: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { quick: defaultSettings.quick },
      }),
    syncInterface: (oldSettings, { payload }) => syncNestedReducer<Global>(oldSettings, payload, 'global'),
    syncDownloads: (oldSettings, { payload }) => syncNestedReducer<Downloads>(oldSettings, payload, 'downloads'),
  } as SettingsReducers,
});
