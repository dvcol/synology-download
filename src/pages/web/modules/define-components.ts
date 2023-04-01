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

  _global.chrome.downloads.search = () => Promise.resolve([]);

  /* eslint-disable @typescript-eslint/no-var-requires, global-require -- necessary for mocking global */
  customElements.define(`wc-${AppInstance.content}`, require('@src/pages/content/components/content-app-wc').ContentAppWc);

  customElements.define(`wc-${AppInstance.standalone}`, require('@src/components/web/standalone-app-wc').StandaloneAppWc);
  /* eslint-enable @typescript-eslint/no-var-requires, global-require */
};
