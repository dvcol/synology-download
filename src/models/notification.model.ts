import NotificationOptions = chrome.notifications.NotificationOptions;

export enum NotificationLevel {
  trace = -2,
  debug = -1,
  info = 0,
  warn = 1,
  error = 2,
}

export const NotificationLevelKeys = {
  [NotificationLevel.trace]: 'Trace',
  [NotificationLevel.debug]: 'Debug',
  [NotificationLevel.info]: 'Info',
  [NotificationLevel.warn]: 'Warn',
  [NotificationLevel.error]: 'Error',
};

export interface NotificationScope {
  background: boolean;
  popup: boolean;
  finished: boolean;
  failed: boolean;
}

export type ChromeNotification = NotificationOptions;
