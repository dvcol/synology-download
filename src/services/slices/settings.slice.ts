import {combineReducers, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {defaultOptions, Settings, settingsKey} from "../../models/settings.model";
import {ContextMenuOption} from "../../models/context-menu.model";
import {TaskTab} from "../../models/tab.model";
import {ChromeMessage, ChromeMessageType} from "../../models/message.model";

const setReducer = (oldSettings: Settings, action: PayloadAction<Settings>): Settings => ({...oldSettings, ...action?.payload})

const syncReducer = (oldSettings: Settings, action: PayloadAction<Settings>): Settings => {
    const newSettings = setReducer(oldSettings, action);
    console.log('sync reducer', newSettings)
    chrome.storage.sync.set({settings: JSON.stringify(newSettings)}, () => {
        //TODO: notification setting saved
    });
    return newSettings;
}

const syncPayload = <T>(oldSettings: Settings | any, key: string, filter: (array: T[]) => T[]): Settings => {
    return syncReducer(oldSettings, {
        type: 'sync', payload: {...oldSettings, [key]: filter(oldSettings[key])}
    });
}

const addTo = <T>(oldSettings: Settings | any, action: PayloadAction<T>, key: string, filter: (obj: T) => boolean): Settings => {
    return syncPayload<T>(oldSettings, key, (array) => (
        array?.length
            ? [...array.filter(filter), action?.payload]
            : [action?.payload]));
}

const removeFrom = <T, U>(oldSettings: Settings | any, action: PayloadAction<U>, key: string, filter: (obj: T) => boolean): Settings => {
    return syncPayload<T>(oldSettings, key, (array => array?.filter(filter)));
}

export const settingsSlice = createSlice({
    name: settingsKey,
    initialState: defaultOptions,
    reducers: {
        set: setReducer,
        sync: syncReducer,
        reset: (oldSettings) => syncReducer(oldSettings, {type: 'sync', payload: defaultOptions}),
        addContextMenu: (oldSettings, action: PayloadAction<ContextMenuOption>): Settings => {
            const newSettings = addTo<ContextMenuOption>(oldSettings, action, 'menus', (o) => o.id !== action?.payload.id);
            chrome.runtime.sendMessage({type: ChromeMessageType.option, payload: 'add'} as ChromeMessage);
            return newSettings;
        },
        removeContextMenu: (oldSettings, action: PayloadAction<string>): Settings | void => {
            if (oldSettings.menus?.length) {
                const newSettings = removeFrom<ContextMenuOption, string>(oldSettings, action, 'menus', (o) => o.id !== action?.payload);
                chrome.runtime.sendMessage({type: ChromeMessageType.option, payload: 'remove'} as ChromeMessage);
                return newSettings;
            }
        },
        addTaskTab: (oldSettings, action: PayloadAction<TaskTab>): Settings =>
            addTo<TaskTab>(oldSettings, action, 'tabs', (o) => o.name !== action?.payload.name),
        removeTaskTab: (oldSettings, action: PayloadAction<string>): Settings =>
            removeFrom<TaskTab, string>(oldSettings, action, 'tabs', (o) => o.name !== action?.payload)
    }
})

// Action creators are generated for each case reducer function
export const {set, sync, reset, addContextMenu, removeContextMenu, addTaskTab, removeTaskTab} = settingsSlice.actions


const rootReducer = combineReducers({
    settings: settingsSlice.reducer
});

export type SettingsState = ReturnType<typeof rootReducer>;

export default settingsSlice.reducer
