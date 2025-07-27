import type { ScrapedContents, ScrapedPage } from '@src/models';
import type { TaskDialogIntercept } from '@src/pages/content/service';
import type { OnClickData } from '@src/utils';

import type { DownloadQueryPayload } from './download.model';
import type { ContextMenu } from './menu.model';
import type { ChromeNotification, SnackNotification } from './notification.model';
import type { QueryAutoLoginOptions } from './query.model';
import type { SynologyQueryPayload } from './synology.model';
import type { TaskForm } from './task.model';

import OpenOptions = chrome.sidePanel.OpenOptions;

/**
 * Enumeration for message types
 */
export enum ChromeMessageType {
  openTaskPopup = 'openTaskPopup',
  openTaskPanel = 'openTaskPanel',
  routeTaskForm = 'routeTaskForm',
  routeScrapePage = 'routeScrapePage',
  clickMenu = 'clickMenu',
  addMenu = 'addMenu',
  updateMenu = 'updateMenu',
  removeMenu = 'removeMenu',
  resetMenu = 'resetMenu',
  toggleScrapeMenu = 'toggleScrapeMenu',
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
  scrap = 'scrap',
  scraped = 'scraped',
}

export type ScrapedContentsPayload = {
  page: ScrapedPage;
  contents: ScrapedContents;
};

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

export type OpenPopupPayload = {
  form: TaskForm;
  intercept?: TaskDialogIntercept;
};

export type OpenPanelPayload = {
  options?: OpenOptions;
  form: TaskForm;
  intercept?: TaskDialogIntercept;
};

export type ResetMenuPayload = {
  menus: ContextMenu[];
  scrape?: boolean;
};

/**
 * Type union of possible message payloads
 */
export type ChromeMessagePayload =
  | boolean
  | string
  | ContextMenu
  | ResetMenuPayload
  | ChromeNotification
  | SynologyQueryPayload
  | DownloadQueryPayload
  | ContextMenuOnClickPayload
  | SnackNotification
  | InterceptPayload
  | QueryAutoLoginOptions
  | ScrapedContentsPayload
  | OpenPopupPayload
  | OpenPanelPayload;

/**
 * Message interface for communication between content & background
 */
export interface ChromeMessage<T extends ChromeMessagePayload = ChromeMessagePayload> {
  type: ChromeMessageType;
  payload?: T;
}
