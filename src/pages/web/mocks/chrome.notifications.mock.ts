import { BaseLoggerService } from '../../../services/logger/base-logger.service';

export function patchNotifications(_global = window) {
  _global.chrome.notifications.create = (async (notificationId: unknown, options: unknown) => {
    BaseLoggerService.debug('chrome.notifications.create', { notificationId, options });
    return typeof notificationId === 'string' ? notificationId : '';
  }) as typeof chrome.notifications.create;
  return _global.chrome.notifications;
}
