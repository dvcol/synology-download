import { chromeMock } from '@src/mocks';
import { AppInstance } from '@src/models';
import { deepMerge } from '@src/utils/object.utils';

export const defineComponents = (_global = window) => {
  _global.chrome = deepMerge(_global.chrome, chromeMock);

  _global.chrome.action.setBadgeText = badge => {
    console.debug('chrome.action.setBadgeText', badge);
    return Promise.resolve();
  };
  _global.chrome.action.setTitle = title => {
    console.debug('chrome.action.setTitle', title);
    return Promise.resolve();
  };

  _global.chrome.storage.local.set = items => {
    console.debug('chrome.storage.local.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.local.get = keys => {
    console.debug('chrome.storage.local.set', keys);
    return Promise.resolve({});
  };

  _global.chrome.storage.sync.set = items => {
    console.debug('chrome.storage.sync.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.sync.get = keys => {
    console.debug('chrome.storage.sync.set', keys);
    return Promise.resolve({});
  };

  _global.chrome.downloads.search = () => Promise.resolve([]);

  /* eslint-disable @typescript-eslint/no-var-requires, global-require -- necessary for mocking global */
  customElements.define(`wc-${AppInstance.content}`, require('@src/pages/content/components/content-app-wc').ContentAppWc);

  customElements.define(`wc-${AppInstance.standalone}`, require('@src/components/web/standalone-app-wc').StandaloneAppWc);
  /* eslint-enable @typescript-eslint/no-var-requires, global-require */
};
