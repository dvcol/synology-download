import NotificationOptions = chrome.notifications.NotificationOptions;

export enum NotificationLevel {
  trace,
  debug,
  info,
  warn,
  error,
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
  recap: boolean;
  finished: boolean;
  failed: boolean;
}

export type ChromeNotification = NotificationOptions;
