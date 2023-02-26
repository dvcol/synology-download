import type { DownloadQueryPayload } from '@src/models/download.model';

import type { ContextMenu } from './menu.model';
import type { ChromeNotification } from './notification.model';
import type { SynologyQueryPayload } from './synology.model';

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
  download = 'download',
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
  | DownloadQueryPayload
  | ContextMenuOnClickPayload;

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage<T extends ChromeMessagePayload = ChromeMessagePayload> {
  type: ChromeMessageType;
  payload?: T;
}
