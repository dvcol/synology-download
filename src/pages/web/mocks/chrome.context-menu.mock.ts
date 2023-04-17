import { BaseLoggerService } from '@src/services';

export const patchContextMenus = (_global = window) => {
  _global.chrome.contextMenus.create = (createProperties, cb) => {
    BaseLoggerService.debug('chrome.contextMenus.create', { createProperties });
    cb?.();
    return createProperties.id ?? Math.random()?.toString();
  };

  _global.chrome.contextMenus.update = (id, createProperties, cb) => {
    BaseLoggerService.debug('chrome.contextMenus.update', { createProperties });
    cb?.();
  };

  _global.chrome.contextMenus.remove = (id, cb) => {
    BaseLoggerService.debug('chrome.contextMenus.remove', { id });
    cb?.();
  };

  _global.chrome.contextMenus.removeAll = cb => {
    BaseLoggerService.debug('chrome.contextMenus.removeAll');
    cb?.();
  };

  return _global.chrome.contextMenus;
};
