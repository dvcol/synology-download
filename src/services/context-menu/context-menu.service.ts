import {ContextMenuOption} from "../../models/context-menu.model";
import {ChromeMessageType} from "../../models/message.model";

/**
 * Add a new context menu to chrome with the given options
 */
export function createContextMenu(option: ContextMenuOption) {
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
    }, () => {
        //TODO: notification menu created
        console.info('Context menu created');
    });
}

/**
 * Remove context menu from chrome corresponding to the specified id
 */
export function removeContextMenu(id: string) {
    console.log('deleteContextMenu', id);
    chrome.contextMenus.remove(id, () => {
        //TODO: notification menu removed
        console.info('Context menu removed');
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
