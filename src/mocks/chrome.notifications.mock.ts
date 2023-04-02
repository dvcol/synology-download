export const patchNotifications = (_global = window) => {
  _global.chrome.notifications.create = (notificationId, options) => {
    console.debug('chrome.notifications.create', { notificationId, options });
    return Promise.resolve();
  };
  return _global.chrome.notifications;
};
