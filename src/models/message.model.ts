import type { OnClickData } from '@src/utils';

import type { DownloadQueryPayload } from './download.model';

import type { ContextMenu } from './menu.model';
import type { ChromeNotification, SnackNotification } from './notification.model';

import type { SynologyQueryPayload } from './synology.model';
import type { TaskForm } from './task.model';

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
  popup = 'popup',
  addMenu = 'addMenu',
  updateMenu = 'updateMenu',
  removeMenu = 'removeMenu',
  resetMenu = 'resetMenu',
  notificationBanner = 'notificationBanner',
  notificationSnack = 'notificationSnack',
  polling = 'polling',
  query = 'query',
  download = 'download',
  intercept = 'intercept',
  contentMenuOpen = 'contentMenuOpen',
  contentDialogOpen = 'contentDialogOpen',
  logger = 'logger',
  autoLogin = 'autoLogin',
}

export type InterceptPayload = TaskForm;

export type InterceptResponse = {
  folder?: string;
  aborted: boolean;
  resume?: boolean;
  message?: string;
};

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
  | ContextMenuOnClickPayload
  | SnackNotification
  | InterceptPayload;

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage<T extends ChromeMessagePayload = ChromeMessagePayload> {
  type: ChromeMessageType;
  payload?: T;
}
