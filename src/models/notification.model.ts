import type { OptionsObject } from 'notistack';

import type { NotificationOptions } from '../utils/chrome/chrome.utils';

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

export enum NotificationType {
  banner = 'banner',
  snack = 'snack',
}

export interface BannerNotificationScope {
  background: boolean;
  popup: boolean;
  finished: boolean;
  failed: boolean;
}

export interface SnackNotificationScope {
  popup: boolean;
  content: boolean;
}

export type ChromeNotification = NotificationOptions;

export interface SnackButton {
  title: string;
  url?: string;
}

export interface SnackMessage {
  title: string;
  message?: string;
  contextMessage?: string;
  priority?: NotificationLevel;
  success?: boolean;
  buttons?: SnackButton[];
}

export interface SnackNotification { message: SnackMessage; options?: OptionsObject }

export interface NotificationServiceOptions { type?: NotificationType; options?: OptionsObject }
