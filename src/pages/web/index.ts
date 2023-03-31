import { chromeMock } from '@src/mocks/chrome.mock';
import { AppInstance } from '@src/models/app-instance.model';

global.chrome = chromeMock;

global.chrome.action.setBadgeText = badge => {
  console.debug('chrome.action.setBadgeText', badge);
  return Promise.resolve();
};
global.chrome.action.setTitle = title => {
  console.debug('chrome.action.setTitle', title);
  return Promise.resolve();
};

global.chrome.downloads.search = () => Promise.resolve([]);

/* eslint-disable @typescript-eslint/no-var-requires */
customElements.define(`wc-${AppInstance.content}`, require('@src/pages/content/components/content-app-wc').ContentAppWc);

customElements.define(`wc-${AppInstance.standalone}`, require('@src/components/web/standalone-app-wc').StandaloneAppWc);
/* eslint-enable @typescript-eslint/no-var-requires */

if (module.hot) module.hot.accept();
