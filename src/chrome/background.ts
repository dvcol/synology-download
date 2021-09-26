import {ChromeMessageType} from "../models/message.model";
import {defaultOptions, settingsKey, SettingsSlice} from "../models/settings.model";
import {sync} from "../services/store/slices/settings.slice";
import {set} from "../services/store/slices/navbar.slice";
import {initStore} from "../services/store/store.config";
import {buildContextMenu, createContextMenu, removeContextMenu} from "../services/context-menu/context-menu.service";

export {}

// Declared in background for persistance
export const store = initStore();

// Restore settings
chrome.storage.sync.get(settingsKey, ({settings}) => {
        const parsed: SettingsSlice = JSON.parse(settings || "{}")
        store.dispatch(sync(parsed));
        if (parsed?.tabs?.length) {
            store.dispatch(set(parsed?.tabs[0]))
        }
        // Build context menu if exist
        buildContextMenu(parsed?.menus || defaultOptions.menus);
    }
);


// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any) => {
    console.log(request)
    if (request.type === ChromeMessageType.link) {
        console.log(request.payload);
    } else if (request.type === ChromeMessageType.addMenu) {
        console.log('message addMenu', request);
        createContextMenu(request.payload)
    } else if (request.type === ChromeMessageType.removeMenu) {
        console.log('message removeMenu', request);
        removeContextMenu(request.payload)
    }
});

