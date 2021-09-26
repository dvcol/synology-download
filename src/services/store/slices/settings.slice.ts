import {combineReducers, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {defaultOptions, settingsKey, SettingsSlice} from "../../../models/settings.model";
import {ContextMenuOption} from "../../../models/context-menu.model";
import {TaskTab} from "../../../models/tab.model";
import {ChromeMessage, ChromeMessageType} from "../../../models/message.model";

const setReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => ({...oldSettings, ...action?.payload})

const syncReducer = (oldSettings: SettingsSlice, action: PayloadAction<Partial<SettingsSlice>>): SettingsSlice => {
    const newSettings = setReducer(oldSettings, action);
    console.log('sync reducer', newSettings)
    chrome.storage.sync.set({settings: JSON.stringify(newSettings)}, () => {
        //TODO: notification setting saved
    });
    return newSettings;
}

const syncPayload = <T>(oldSettings: SettingsSlice | any, key: string, filter: (array: T[]) => T[]): SettingsSlice => {
    return syncReducer(oldSettings, {
        type: 'sync', payload: {...oldSettings, [key]: filter(oldSettings[key])}
    });
}

const addTo = <T>(oldSettings: SettingsSlice | any, action: PayloadAction<T>, key: string, filter: (obj: T) => boolean): SettingsSlice => {
    return syncPayload<T>(oldSettings, key, (array) => (
        array?.length
            ? [...array.filter(filter), action?.payload]
            : [action?.payload]));
}

const removeFrom = <T, U>(oldSettings: SettingsSlice | any, action: PayloadAction<U>, key: string, filter: (obj: T) => boolean): SettingsSlice => {
    return syncPayload<T>(oldSettings, key, (array => array?.filter(filter)));
}

export const settingsSlice = createSlice({
    name: settingsKey,
    initialState: defaultOptions,
    reducers: {
        set: setReducer,
        sync: syncReducer,
        reset: (oldSettings) => syncReducer(oldSettings, {type: 'sync', payload: defaultOptions}),
        addContextMenu: (oldSettings, action: PayloadAction<ContextMenuOption>): SettingsSlice => {
            chrome.runtime.sendMessage({type: ChromeMessageType.addMenu, payload: action.payload} as ChromeMessage);
            return addTo<ContextMenuOption>(oldSettings, action, 'menus', (o) => o.id !== action?.payload.id);
        },
        removeContextMenu: (oldSettings, action: PayloadAction<string>): SettingsSlice | void => {
            if (oldSettings.menus?.length) {
                chrome.runtime.sendMessage({
                    type: ChromeMessageType.removeMenu,
                    payload: action?.payload
                } as ChromeMessage);
                return removeFrom<ContextMenuOption, string>(oldSettings, action, 'menus', (o) => o.id !== action?.payload);
            }
        },
        addTaskTab: (oldSettings, action: PayloadAction<TaskTab>): SettingsSlice =>
            addTo<TaskTab>(oldSettings, action, 'tabs', (o) => o.id !== action?.payload.id),
        removeTaskTab: (oldSettings, action: PayloadAction<string>): SettingsSlice =>
            removeFrom<TaskTab, string>(oldSettings, action, 'tabs', (o) => o.id !== action?.payload),
        resetTaskTab: (oldSettings): SettingsSlice => syncReducer(oldSettings, {
            type: 'sync',
            payload: {tabs: defaultOptions.tabs}
        }),
    }
})

// Action creators are generated for each case reducer function
export const {
    set,
    sync,
    reset,
    addContextMenu,
    removeContextMenu,
    addTaskTab,
    removeTaskTab,
    resetTaskTab
} = settingsSlice.actions


const rootReducer = combineReducers({
    settings: settingsSlice.reducer
});

export type SettingsState = ReturnType<typeof rootReducer>;

export default settingsSlice.reducer
