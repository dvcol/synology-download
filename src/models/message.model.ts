import { ChromeNotification } from './notification.model';
import { SynologyQueryPayload } from './synology.model';
import { ContextMenu } from './menu.model';
import MessageSender = chrome.runtime.MessageSender;
import OnClickData = chrome.contextMenus.OnClickData;

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
  popup = 'popup',
  addMenu = 'addMenu',
  updateMenu = 'updateMenu',
  removeMenu = 'removeMenu',
  resetMenu = 'resetMenu',
  notification = 'notification',
  query = 'query',
  baseUrl = 'baseUrl',
}

/**
 * Type union of possible message payloads
 */
export type ChromeMessagePayload = string | ContextMenu | ContextMenu[] | ChromeNotification | SynologyQueryPayload | OnClickData;

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage<T extends ChromeMessagePayload = ChromeMessagePayload> {
  type: ChromeMessageType;
  payload?: T;
}

/**
 * Message handler signature for Rxjs wrapping.
 */
export type ChromeMessageHandler<M, R> = {
  message: ChromeMessage<M>;
  sender: MessageSender;
  sendResponse: (response?: ChromeResponse<R>) => void;
};

/**
 * Response wrapper for payload proxy
 */
export type ChromeResponse<T = any> = { success: boolean; payload?: T; error?: Error };
