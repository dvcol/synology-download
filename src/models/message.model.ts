import type { ContextMenu } from './menu.model';
import type { ChromeNotification } from './notification.model';
import type { SynologyQueryPayload } from './synology.model';

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
  polling = 'polling',
  query = 'query',
  baseUrl = 'baseUrl',
}

export type ContextMenuOnClickPayload = {
  info: OnClickData;
  menu: ContextMenu;
};

/**
 * Type union of possible message payloads
 */
export type ChromeMessagePayload =
  | boolean
  | string
  | ContextMenu
  | ContextMenu[]
  | ChromeNotification
  | SynologyQueryPayload
  | ContextMenuOnClickPayload;

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
export type ChromeMessageHandler<M extends ChromeMessagePayload, R> = {
  message: ChromeMessage<M>;
  sender: MessageSender;
  sendResponse: (response?: ChromeResponse<R>) => void;
};

/**
 * Response wrapper for payload proxy
 */
export type ChromeResponse<T = any> = { success: boolean; payload?: T; error?: Error };
