import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChromeMessage, ChromeMessageType, Connection, ContextMenuOption, defaultSettings, Polling, SettingsSlice, TaskTab } from '../../models';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { addTo, removeFrom, setReducer, syncNestedReducer, syncReducer } from '../reducers';

interface SettingsReducers<S = SettingsSlice> extends SliceCaseReducers<S> {
  setSettings: CaseReducer<S, PayloadAction<S>>;
  syncSettings: CaseReducer<S, PayloadAction<Partial<S>>>;
  resetSettings: CaseReducer<S>;
  syncConnection: CaseReducer<S, PayloadAction<Partial<Connection>>>;
  syncPolling: CaseReducer<S, PayloadAction<Partial<Polling>>>;
  addContextMenu: CaseReducer<S, PayloadAction<ContextMenuOption>>;
  removeContextMenu: CaseReducer<S, PayloadAction<string>>;
  addTaskTab: CaseReducer<S, PayloadAction<TaskTab>>;
  removeTaskTab: CaseReducer<S, PayloadAction<string>>;
  resetTaskTab: CaseReducer<S>;
}

export const settingsSlice = createSlice<SettingsSlice, SettingsReducers, 'settings'>({
  name: 'settings',
  initialState: defaultSettings,
  reducers: {
    setSettings: setReducer,
    syncSettings: syncReducer,
    resetSettings: (oldSettings) => syncReducer(oldSettings, { type: 'sync', payload: defaultSettings }),
    syncConnection: (oldSettings, action) => syncNestedReducer<Connection>(oldSettings, action, 'connection'),
    syncPolling: (oldSettings, action) => syncNestedReducer<Polling>(oldSettings, action, 'polling'),
    addContextMenu: (oldSettings, action: PayloadAction<ContextMenuOption>): SettingsSlice => {
      chrome.runtime.sendMessage({
        type: ChromeMessageType.addMenu,
        payload: action.payload,
      } as ChromeMessage);
      return addTo<ContextMenuOption>(oldSettings, action, 'menus', (o) => o.id !== action?.payload.id);
    },
    removeContextMenu: (oldSettings, action: PayloadAction<string>): SettingsSlice | void => {
      if (oldSettings.menus?.length) {
        chrome.runtime.sendMessage({
          type: ChromeMessageType.removeMenu,
          payload: action?.payload,
        } as ChromeMessage);
        return removeFrom<ContextMenuOption, string>(oldSettings, action, 'menus', (o) => o.id !== action?.payload);
      }
    },
    addTaskTab: (oldSettings, action: PayloadAction<TaskTab>): SettingsSlice => addTo<TaskTab>(oldSettings, action, 'tabs', (o) => o.id !== action?.payload.id),
    removeTaskTab: (oldSettings, action: PayloadAction<string>): SettingsSlice => removeFrom<TaskTab, string>(oldSettings, action, 'tabs', (o) => o.id !== action?.payload),
    resetTaskTab: (oldSettings): SettingsSlice =>
      syncReducer(oldSettings, {
        type: 'sync',
        payload: { tabs: defaultSettings.tabs },
      }),
  } as SettingsReducers,
});

// Action creators are generated for each case reducer function
export const { setSettings, syncSettings, syncConnection, syncPolling, resetSettings, addContextMenu, removeContextMenu, addTaskTab, removeTaskTab, resetTaskTab } = settingsSlice.actions;
