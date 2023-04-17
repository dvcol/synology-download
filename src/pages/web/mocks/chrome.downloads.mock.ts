import { BaseLoggerService } from '@src/services';

export const patchDownloads = (_global = window) => {
  _global.chrome.downloads.search = query => {
    BaseLoggerService.debug('chrome.downloads.search', query);
    return Promise.resolve([]);
  };
  _global.chrome.downloads.erase = query => {
    BaseLoggerService.debug('chrome.downloads.erase', query);
    return Promise.resolve([0]);
  };
  _global.chrome.downloads.download = query => {
    BaseLoggerService.debug('chrome.downloads.download', query);
    return Promise.resolve(0);
  };
  _global.chrome.downloads.pause = downloadId => {
    BaseLoggerService.debug('chrome.downloads.pause', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.resume = downloadId => {
    BaseLoggerService.debug('chrome.downloads.resume', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.cancel = downloadId => {
    BaseLoggerService.debug('chrome.downloads.cancel', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.open = downloadId => {
    BaseLoggerService.debug('chrome.downloads.open', downloadId);
    return Promise.resolve();
  };
  return _global.chrome.downloads;
};
