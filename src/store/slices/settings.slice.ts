import type { PayloadAction } from '@reduxjs/toolkit';

import type { ContextMenu, QuickMenu } from '../../models/menu.model';
import type {
  AdvancedSettings,
  ContentSettings,
  DownloadSettings,
  NotificationSettings,
  PollingSettings,
  ScrapeSettings,
  TaskSettings,
} from '../../models/settings.model';
import type { SettingsSlice } from '../../models/store.model';
import type { ContentTab } from '../../models/tab.model';

import { createSlice } from '@reduxjs/toolkit';

import { defaultSettings } from '../../models/settings.model';
import { SettingsSliceName } from '../../models/store.model';
import {
  addTo,
  removeFrom,
  setBadgeReducer,
  setReducer,
  setSyncSettingsReducer,
  syncAdvancedLoggingReducer,
  syncConnectionReducer,
  syncInterceptReducer,
  syncInterfaceReducer,
  syncNestedReducer,
  syncReducer,
} from '../reducers/settings.reducer';

export const settingsSlice = createSlice({
  name: SettingsSliceName,
  initialState: defaultSettings,
  reducers: {
    setSettings: setReducer,
    syncSettings: syncReducer,
    resetSettings: oldSettings => syncReducer(oldSettings, { type: 'sync', payload: defaultSettings }),
    syncConnection: syncConnectionReducer,
    syncPolling: (oldSettings, { payload }: PayloadAction<Partial<PollingSettings>>) => syncNestedReducer<PollingSettings>(oldSettings, payload, 'polling'),
    syncNotifications: (oldSettings, action: PayloadAction<Partial<NotificationSettings>>) => setBadgeReducer(oldSettings, action),
    setContextMenus: (oldSettings, { payload: menus }: PayloadAction<ContextMenu[]>): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { menus },
      }),
    saveContextMenu: (oldSettings, { payload }: PayloadAction<ContextMenu>): SettingsSlice =>
      addTo<ContextMenu, 'menus'>(oldSettings, payload, 'menus', o => o.id === payload?.id),
    removeContextMenu: (oldSettings, { payload }: PayloadAction<string>): SettingsSlice | void => {
      if (oldSettings.menus?.length) {
        return removeFrom<ContextMenu, 'menus'>(oldSettings, 'menus', o => o.id !== payload);
      }
    },
    resetContextMenu: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { menus: defaultSettings.menus },
      }),
    setContentTabs: (oldSettings, { payload: tabs }: PayloadAction<ContentTab[]>): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs },
      }),
    saveContentTab: (oldSettings, { payload }: PayloadAction<ContentTab>): SettingsSlice => addTo<ContentTab, 'tabs'>(oldSettings, payload, 'tabs', o => o.id === payload.id),
    removeContentTab: (oldSettings, { payload }: PayloadAction<string>): SettingsSlice => removeFrom<ContentTab, 'tabs'>(oldSettings, 'tabs', o => o.id !== payload),
    resetContentTabs: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs: defaultSettings.tabs },
      }),
    setQuickMenus: (oldSettings, { payload: quick }: PayloadAction<QuickMenu[]>): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { quick },
      }),
    saveQuickMenu: (oldSettings, { payload }: PayloadAction<QuickMenu>): SettingsSlice => addTo<QuickMenu, 'quick'>(oldSettings, payload, 'quick', o => o.id === payload?.id),
    removeQuickMenu: (oldSettings, { payload }: PayloadAction<string>): SettingsSlice => removeFrom<QuickMenu, 'quick'>(oldSettings, 'quick', o => o.id !== payload),
    resetQuickMenus: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { quick: defaultSettings.quick },
      }),
    syncInterface: syncInterfaceReducer,
    syncDownloads: (oldSettings, { payload }: PayloadAction<Partial<DownloadSettings>>) => syncNestedReducer<DownloadSettings>(oldSettings, payload, 'downloads'),
    syncDownloadsIntercept: syncInterceptReducer,
    syncAdvanced: (oldSettings, { payload }: PayloadAction<AdvancedSettings>) => syncNestedReducer<AdvancedSettings>(oldSettings, payload, 'advanced'),
    syncAdvancedLogging: syncAdvancedLoggingReducer,
    setSyncSettings: setSyncSettingsReducer,
    syncTasksSettings: (oldSettings, { payload }: PayloadAction<TaskSettings>) => syncNestedReducer<TaskSettings>(oldSettings, payload, 'tasks'),
    syncScrapeSettings: (oldSettings, { payload }: PayloadAction<Partial<ScrapeSettings>>) => syncNestedReducer<ScrapeSettings>(oldSettings, payload, 'scrape'),
    syncContentSettings: (oldSettings, { payload }: PayloadAction<Partial<ContentSettings>>) => syncNestedReducer<ContentSettings>(oldSettings, payload, 'content'),
  },
});
