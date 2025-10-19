import { BaseLoggerService } from '@src/services';

export function patchTabs(_global = window) {
  _global.chrome.tabs.create = async (createProperties) => {
    BaseLoggerService.debug('chrome.tabs.create', createProperties);
    return Promise.resolve({} as chrome.tabs.Tab);
  };
  _global.chrome.tabs.query = async (query) => {
    BaseLoggerService.debug('chrome.tabs.query', query);
    return Promise.resolve([]);
  };

  return _global.chrome.downloads;
}
