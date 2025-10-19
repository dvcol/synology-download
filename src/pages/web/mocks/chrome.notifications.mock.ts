import { BaseLoggerService } from '@src/services';

export function patchNotifications(_global = window) {
  _global.chrome.notifications.create = async (notificationId, options) => {
    BaseLoggerService.debug('chrome.notifications.create', { notificationId, options });
    return Promise.resolve();
  };
  return _global.chrome.notifications;
}
