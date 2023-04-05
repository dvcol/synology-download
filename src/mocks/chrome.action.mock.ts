import { BaseLoggerService } from '@src/services';

export const patchAction = (_global = window) => {
  _global.chrome.action.setBadgeText = badge => {
    BaseLoggerService.debug('chrome.action.setBadgeText', badge);
    return Promise.resolve();
  };
  _global.chrome.action.setTitle = title => {
    BaseLoggerService.debug('chrome.action.setTitle', title);
    return Promise.resolve();
  };
  _global.chrome.action.setBadgeBackgroundColor = details => {
    BaseLoggerService.debug('chrome.action.setBadgeBackgroundColor', details);
    return Promise.resolve();
  };
  return _global.chrome.action;
};
