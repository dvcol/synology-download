/** @see chrome.notifications.NotificationOptions */
export type NotificationOptions<T extends boolean = false> = chrome.notifications.NotificationOptions<T>;

/** @see chrome.action.setIcon */
export const setIcon = chrome?.action?.setIcon;

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

/** @see chrome.action.openPopup */
export const openPopup: typeof chrome.action.openPopup | undefined = chrome?.action?.openPopup;

/** @see chrome.sidePanel.open */
export const openPanel: typeof chrome.sidePanel.open | undefined = chrome?.sidePanel?.open;

/**
 * Check if the side panel is set to open on action click
 */
export function isSidePanelEnabledCb(cb: (enabled?: boolean) => unknown) {
  if (!chrome?.sidePanel) return cb();
  return chrome.sidePanel.getPanelBehavior(({ openPanelOnActionClick }) => cb(openPanelOnActionClick));
}

export async function isSidePanelEnabled() {
  if (!chrome?.sidePanel) return false;
  const behavior = await chrome.sidePanel.getPanelBehavior();
  return behavior.openPanelOnActionClick;
}

/** @see chrome.windows.getCurrent */
export const getCurrentWindow: typeof chrome.windows.getCurrent | undefined = chrome?.windows?.getCurrent;
