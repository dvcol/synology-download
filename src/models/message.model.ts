import {ContextMenuOption} from "./options.model";

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
    link = 'link',
    popup = 'popup',
    option = 'option'
}

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage {
    type: ChromeMessageType,
    payload: string | ContextMenuOption,

}