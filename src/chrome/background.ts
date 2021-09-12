import MessageSender = chrome.runtime.MessageSender;
import {ChromeMessageType} from "../models/message.model";
import {ContextMenuOption} from "../models/context-menu.model";
import {defaultOptions, Settings, settingsKey} from "../models/settings.model";
import {settingsSlice, sync} from "../services/slices/settings.slice";
import {configureStore} from "@reduxjs/toolkit";
import {navbarSlice} from "../services/slices/navbar.slice";

export {}

// Declared in background for persistance
export const store = configureStore({
    reducer: {
        navbar: navbarSlice.reducer,
        settings: settingsSlice.reducer
    },
});


/**
 * Add a new context menu to chrome with the given options
 */
function createContextMenu(option: ContextMenuOption) {
    console.log('createContextMenu', option);
    chrome.contextMenus.create({
        ...option,
        enabled: true,
        onclick: () => {
            // On click instruct content.ts to open the modal
            chrome.tabs.query({active: true, currentWindow: true}, tabs => {
                if (tabs[0].id !== undefined) chrome.tabs.sendMessage(tabs[0].id, {type: ChromeMessageType.popup});
            });
        }
    });
}

/**
 * Build context menu for the menu options given
 * @param options the options
 */
export function buildContextMenu(options: ContextMenuOption[] | undefined) {
    chrome.contextMenus.removeAll();
    if (options?.length) options.forEach((o) => createContextMenu(o))
}

// Restore settings
// TODO: Remove clear
chrome.storage.sync.get(settingsKey, ({settings}) => {
        const parsed: Settings = JSON.parse(settings || "{}")
        store.dispatch(sync(parsed));
        // Build context menu if exist
        buildContextMenu(parsed?.menus || defaultOptions.menus);
        console.log('re-load', parsed, store.getState().settings)
    }
);


// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any, sender: MessageSender, sendResponse: any) => {
    console.log(request)
    if (request.type === ChromeMessageType.link) {
        console.log(request.payload);
    } else if (request.type === ChromeMessageType.option) {
        console.log('message option', store.getState().settings.menus);
        buildContextMenu(store.getState().settings.menus);
    }
});

