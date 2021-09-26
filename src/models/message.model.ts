/**
 * Enumeration for message types
 */
import {ContextMenuOption} from "./context-menu.model";

export enum ChromeMessageType {
    link = 'link',
    popup = 'popup',
    addMenu = 'addMenu',
    removeMenu = 'removeMenu'
}

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage {
    type: ChromeMessageType,
    payload: string | ContextMenuOption,

}
