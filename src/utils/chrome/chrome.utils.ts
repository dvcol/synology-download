import { from, map } from 'rxjs';

import type { Observable } from 'rxjs';

/** @see chrome.notifications.NotificationOptions */
export type NotificationOptions<T extends boolean = false> = chrome.notifications.NotificationOptions<T>;

/** @see chrome.action.setBadgeText */
export const setBadgeText = chrome?.action?.setBadgeText;

/** @see chrome.action.setTitle */
export const setTitle = chrome?.action?.setTitle;

/** @see chrome.action.setBadgeBackgroundColor */
export const setBadgeBackgroundColor = chrome?.action?.setBadgeBackgroundColor;

/** @see chrome.notifications.create */
export const createNotification = chrome?.notifications?.create;

/** @see chrome.tabs.create */
export const createTab = chrome?.tabs?.create;

/** @see chrome.tabs.query */
export const queryTab = chrome?.tabs?.query;

/** @see chrome.tabs.QueryInfo */
export type QueryInfo = chrome.tabs.QueryInfo;

/** @see chrome.tabs.Tab */
export type Tab = chrome.tabs.Tab;

export const getActiveTab = (queryInfo: QueryInfo = { active: true, currentWindow: true }): Observable<Tab> =>
  from(queryTab(queryInfo)).pipe(map(([tab]) => tab));
