import { BaseLoggerService } from '@src/services';

export const patchTabs = (_global = window) => {
  _global.chrome.tabs.create = createProperties => {
    BaseLoggerService.debug('chrome.tabs.create', createProperties);
    return Promise.resolve({} as any);
  };
  _global.chrome.tabs.query = query => {
    BaseLoggerService.debug('chrome.tabs.query', query);
    return Promise.resolve([]);
  };

  return _global.chrome.downloads;
};
