import { createSlice } from '@reduxjs/toolkit';

import type {
  AdvancedLogging,
  AdvancedSettings,
  ConnectionSettings,
  ContentTab,
  ContextMenu,
  DownloadSettings,
  DownloadsIntercept,
  GlobalSettings,
  NotificationSettings,
  PollingSettings,
  QuickMenu,
  SettingsSlice,
  SyncSettings,
  TaskSettings,
} from '@src/models';
import { defaultSettings, SettingsSliceName } from '@src/models';

import {
  addTo,
  removeFrom,
  setBadgeReducer,
  setReducer,
  setSyncSettingsReducer,
  syncAdvancedLoggingReducer,
  syncConnectionReducer,
  syncInterceptReducer,
  syncNestedReducer,
  syncReducer,
} from '../reducers/settings.reducer';

import type { PayloadAction } from '@reduxjs/toolkit';
import type { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import type { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

interface SettingsReducers<S = SettingsSlice> extends SliceCaseReducers<S> {
  setSettings: CaseReducer<S, PayloadAction<S>>;
  syncSettings: CaseReducer<S, PayloadAction<Partial<S>>>;
  resetSettings: CaseReducer<S>;
  syncConnection: CaseReducer<S, PayloadAction<Partial<ConnectionSettings>>>;
  syncPolling: CaseReducer<S, PayloadAction<Partial<PollingSettings>>>;
  syncNotifications: CaseReducer<S, PayloadAction<Partial<NotificationSettings>>>;
  setContextMenus: CaseReducer<S, PayloadAction<ContextMenu[]>>;
  saveContextMenu: CaseReducer<S, PayloadAction<ContextMenu>>;
  removeContextMenu: CaseReducer<S, PayloadAction<string>>;
  resetContextMenu: CaseReducer<S>;
  setContentTabs: CaseReducer<S, PayloadAction<ContentTab[]>>;
  saveContentTab: CaseReducer<S, PayloadAction<ContentTab>>;
  removeContentTab: CaseReducer<S, PayloadAction<string>>;
  resetContentTabs: CaseReducer<S>;
  setQuickMenus: CaseReducer<S, PayloadAction<QuickMenu[]>>;
  saveQuickMenu: CaseReducer<S, PayloadAction<QuickMenu>>;
  removeQuickMenu: CaseReducer<S, PayloadAction<string>>;
  resetQuickMenus: CaseReducer<S>;
  syncInterface: CaseReducer<S, PayloadAction<Partial<GlobalSettings>>>;
  syncDownloads: CaseReducer<S, PayloadAction<Partial<DownloadSettings>>>;
  syncDownloadsIntercept: CaseReducer<S, PayloadAction<DownloadsIntercept>>;
  syncAdvanced: CaseReducer<S, PayloadAction<AdvancedSettings>>;
  syncAdvancedLogging: CaseReducer<S, PayloadAction<AdvancedLogging>>;
  setSyncSettings: CaseReducer<S, PayloadAction<Partial<SyncSettings>>>;
  syncTasksSettings: CaseReducer<S, PayloadAction<TaskSettings>>;
}

export const settingsSlice = createSlice<SettingsSlice, SettingsReducers, 'settings'>({
  name: SettingsSliceName,
  initialState: defaultSettings,
  reducers: {
    setSettings: setReducer,
    syncSettings: syncReducer,
    resetSettings: oldSettings => syncReducer(oldSettings, { type: 'sync', payload: defaultSettings }),
    syncConnection: syncConnectionReducer,
    syncPolling: (oldSettings, { payload }) => syncNestedReducer<PollingSettings>(oldSettings, payload, 'polling'),
    syncNotifications: (oldSettings, action) => setBadgeReducer(oldSettings, action),
    setContextMenus: (oldSettings, { payload: menus }): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { menus },
      }),
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
    setContentTabs: (oldSettings, { payload: tabs }): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs },
      }),
    saveContentTab: (oldSettings, { payload }): SettingsSlice => addTo<ContentTab, 'tabs'>(oldSettings, payload, 'tabs', o => o.id === payload.id),
    removeContentTab: (oldSettings, { payload }): SettingsSlice => removeFrom<ContentTab, 'tabs'>(oldSettings, 'tabs', o => o.id !== payload),
    resetContentTabs: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs: defaultSettings.tabs },
      }),
    setQuickMenus: (oldSettings, { payload: quick }): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { quick },
      }),
    saveQuickMenu: (oldSettings, { payload }): SettingsSlice => addTo<QuickMenu, 'quick'>(oldSettings, payload, 'quick', o => o.id === payload?.id),
    removeQuickMenu: (oldSettings, { payload }): SettingsSlice => removeFrom<QuickMenu, 'quick'>(oldSettings, 'quick', o => o.id !== payload),
    resetQuickMenus: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { quick: defaultSettings.quick },
      }),
    syncInterface: (oldSettings, { payload }) => syncNestedReducer<GlobalSettings>(oldSettings, payload, 'global'),
    syncDownloads: (oldSettings, { payload }) => syncNestedReducer<DownloadSettings>(oldSettings, payload, 'downloads'),
    syncDownloadsIntercept: syncInterceptReducer,
    syncAdvanced: (oldSettings, { payload }) => syncNestedReducer<AdvancedSettings>(oldSettings, payload, 'advanced'),
    syncAdvancedLogging: syncAdvancedLoggingReducer,
    setSyncSettings: setSyncSettingsReducer,
    syncTasksSettings: (oldSettings, { payload }) => syncNestedReducer<TaskSettings>(oldSettings, payload, 'tasks'),
  },
});
