import { ContextMenuOption } from './context-menu.model';
import { ChromeNotification } from './notification.model';
import { SynologyQueryPayload } from './synology.model';
import MessageSender = chrome.runtime.MessageSender;
import OnClickData = chrome.contextMenus.OnClickData;

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
  createTask = 'createTask',
  popup = 'popup',
  addMenu = 'addMenu',
  removeMenu = 'removeMenu',
  notification = 'notification',
  query = 'query',
  baseUrl = 'baseUrl',
}

/**
 * Payload for Task creation
 */
export interface CreateTaskPayload {
  uri: string;
  source: string;
}

/**
 * Type union of possible message payloads
 */
export type ChromeMessagePayload = string | ContextMenuOption | CreateTaskPayload | ChromeNotification | SynologyQueryPayload | OnClickData;

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
