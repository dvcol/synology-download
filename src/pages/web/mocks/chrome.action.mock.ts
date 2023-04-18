import { BaseLoggerService } from '@src/services';

export type BadgeMock = {
  text?: string;
  title?: string;
  color?: string | [number, number, number, number];
};

const setBadge = (badge: Partial<BadgeMock> = {}, _global = window) => {
  if (!_global._synology) _global._synology = {};
  if (!_global._synology.mock) _global._synology.mock = {};
  if (!_global._synology.mock.badge) _global._synology.mock.badge = {};
  _global._synology.mock.badge = { ..._global._synology.mock.badge, ...badge };
};

export const patchAction = (_global = window) => {
  setBadge();

  _global.chrome.action.setBadgeText = badge => {
    BaseLoggerService.debug('chrome.action.setBadgeText', badge);
    setBadge({ text: badge.text });
    return Promise.resolve();
  };
  _global.chrome.action.setTitle = title => {
    BaseLoggerService.debug('chrome.action.setTitle', title);
    setBadge({ title: title.title });
    return Promise.resolve();
  };
  _global.chrome.action.setBadgeBackgroundColor = details => {
    BaseLoggerService.debug('chrome.action.setBadgeBackgroundColor', details);
    setBadge({ color: details.color });
    return Promise.resolve();
  };
  return _global.chrome.action;
};
