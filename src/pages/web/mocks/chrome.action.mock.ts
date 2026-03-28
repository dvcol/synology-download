import { BaseLoggerService } from '../../../services/logger/base-logger.service';

export interface BadgeMock {
  text?: string;
  title?: string;
  color?: string | [number, number, number, number];
}

function setBadge(badge: Partial<BadgeMock> = {}, _global = window) {
  if (!_global._synology) _global._synology = {};
  if (!_global._synology.mock) _global._synology.mock = {};
  if (!_global._synology.mock.badge) _global._synology.mock.badge = {};
  _global._synology.mock.badge = { ..._global._synology.mock.badge, ...badge };
}

export function patchAction(_global = window) {
  setBadge();

  _global.chrome.action.setBadgeText = async (badge) => {
    BaseLoggerService.debug('chrome.action.setBadgeText', badge);
    setBadge({ text: badge.text });
    return Promise.resolve();
  };
  _global.chrome.action.setTitle = async (title) => {
    BaseLoggerService.debug('chrome.action.setTitle', title);
    setBadge({ title: title.title });
    return Promise.resolve();
  };
  _global.chrome.action.setBadgeBackgroundColor = async (details) => {
    BaseLoggerService.debug('chrome.action.setBadgeBackgroundColor', details);
    setBadge({ color: details.color });
    return Promise.resolve();
  };
  return _global.chrome.action;
}
