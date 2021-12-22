import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Connection, ContextMenuOption, defaultSettings, Notifications, Polling, SettingsSlice, TaskTab } from '../../models';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { addTo, removeFrom, setNestedReducer, setReducer, syncNestedReducer, syncReducer, syncRememberMeReducer } from '../reducers';

interface SettingsReducers<S = SettingsSlice> extends SliceCaseReducers<S> {
  setSettings: CaseReducer<S, PayloadAction<S>>;
  syncSettings: CaseReducer<S, PayloadAction<Partial<S>>>;
  resetSettings: CaseReducer<S>;
  setConnection: CaseReducer<S, PayloadAction<Partial<Connection>>>;
  syncConnection: CaseReducer<S, PayloadAction<Partial<Connection>>>;
  syncRememberMe: CaseReducer<S, PayloadAction<boolean>>;
  syncPolling: CaseReducer<S, PayloadAction<Partial<Polling>>>;
  syncNotifications: CaseReducer<S, PayloadAction<Partial<Notifications>>>;
  addContextMenu: CaseReducer<S, PayloadAction<ContextMenuOption>>;
  removeContextMenu: CaseReducer<S, PayloadAction<string>>;
  saveTaskTab: CaseReducer<S, PayloadAction<TaskTab>>;
  removeTaskTab: CaseReducer<S, PayloadAction<string>>;
  resetTaskTabs: CaseReducer<S>;
}

export const settingsSlice = createSlice<SettingsSlice, SettingsReducers, 'settings'>({
  name: 'settings',
  initialState: defaultSettings,
  reducers: {
    setSettings: setReducer,
    syncSettings: syncReducer,
    resetSettings: (oldSettings) => syncReducer(oldSettings, { type: 'sync', payload: defaultSettings }),
    setConnection: (oldSettings, action) => setNestedReducer<Connection>(oldSettings, action, 'connection'),
    syncConnection: (oldSettings, action) => syncNestedReducer<Connection>(oldSettings, action, 'connection'),
    syncRememberMe: (oldSettings, action) => syncRememberMeReducer(oldSettings, action),
    syncPolling: (oldSettings, action) => syncNestedReducer<Polling>(oldSettings, action, 'polling'),
    syncNotifications: (oldSettings, action) => {
      const color = action?.payload?.count?.color;
      // TODO : move to thunk ?
      if (color !== oldSettings?.notifications?.count?.color) {
        chrome.action.setBadgeBackgroundColor({ color: color ?? '' }).then(() => console.debug('Badge color changed to ', color));
      }
      return syncNestedReducer<Notifications>(oldSettings, action, 'notifications');
    },
    addContextMenu: (oldSettings, action: PayloadAction<ContextMenuOption>): SettingsSlice =>
      addTo<ContextMenuOption>(oldSettings, action, 'menus', (o) => o.id === action?.payload.id),
    removeContextMenu: (oldSettings, action: PayloadAction<string>): SettingsSlice | void => {
      if (oldSettings.menus?.length) {
        return removeFrom<ContextMenuOption, string>(oldSettings, action, 'menus', (o) => o.id !== action?.payload);
      }
    },
    saveTaskTab: (oldSettings, action: PayloadAction<TaskTab>): SettingsSlice =>
      addTo<TaskTab>(oldSettings, action, 'tabs', (o) => o.id === action?.payload.id),
    removeTaskTab: (oldSettings, action: PayloadAction<string>): SettingsSlice =>
      removeFrom<TaskTab, string>(oldSettings, action, 'tabs', (o) => o.id !== action?.payload),
    resetTaskTabs: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs: defaultSettings.tabs },
      }),
  } as SettingsReducers,
});

// Action creators are generated for each case reducer function
export const {
  setSettings,
  syncSettings,
  setConnection,
  syncConnection,
  syncPolling,
  syncNotifications,
  syncRememberMe,
  resetSettings,
  addContextMenu,
  removeContextMenu,
  saveTaskTab,
  removeTaskTab,
  resetTaskTabs,
} = settingsSlice.actions;
