import MessageSender = chrome.runtime.MessageSender;
import {ChromeMessageType} from "../model/message";
import {ContextMenuOption} from "../model/options";

export {}


/**
 * Add a new context menu to chrome with the given options
 */
function addContextMenu(option: ContextMenuOption) {
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
function buildContextMenu(options: ContextMenuOption[] | undefined) {
    chrome.contextMenus.removeAll();
    if (options?.length) options.forEach((o) => addContextMenu(o))
}

/**
 * Persist into sync storage the contextMenuOption
 * @param filter a filter function to handle menu parsing
 */
function persistContextMenu(filter: (args: ContextMenuOption[] | undefined) => ContextMenuOption[] | undefined) {
    chrome.storage.sync.get('menus',
        (response) => {
            console.log(response)
            const menus = filter(response?.menus);
            console.log(menus)
            chrome.storage.sync.set({menus}, () => buildContextMenu(menus));
        });
}

/**
 * Save or update a contextMenu into synced options
 * @param option the option
 */
export const saveContextMenu = (option: ContextMenuOption) => persistContextMenu((menus) => menus?.length ? [...menus.filter((o: ContextMenuOption) => o.id !== option.id), option] : [option]);

/**
 * delete a contextMenu into synced options
 * @param id the id of the option
 */
export const deleteContextMenu = (id: string) => persistContextMenu((menus) => menus?.filter((o: ContextMenuOption) => o.id !== id));

// TODO : delete
// Placeholder to init context menu
saveContextMenu({
    id: 'open',
    title: 'Download with Synology Diskstation',
    contexts: ['link', 'audio', 'video', 'image', 'selection']
});

// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any, sender: MessageSender, sendResponse: any) => {
    console.log(request, sender, sendResponse)
    if (request.type === ChromeMessageType.link) {
        console.log(request.payload);
    } else if (request.type === ChromeMessageType.option) {
        addContextMenu(request.payload)
    }
});


