import { AppInstance } from '@src/models/app-instance.model';
import { chromeMock } from '@src/utils/chrome/chrome.mock';

global.chrome = chromeMock;

global.chrome.runtime.onMessage.addListener = callback => {
  console.info('chrome.runtime.onMessage.addListener');
  callback('mockMessage', { id: 'mockSender' }, (...args) => console.info('chrome.runtime.onMessage.addListener.sendResponse', args));
};

global.chrome.action.setBadgeText = badge => {
  console.info('chrome.action.setBadgeText', badge);
  return Promise.resolve();
};
global.chrome.action.setTitle = title => {
  console.info('chrome.action.setTitle', title);
  return Promise.resolve();
};

global.chrome.downloads.search = () => Promise.resolve([]);

/* eslint-disable @typescript-eslint/no-var-requires */
customElements.define(`wc-${AppInstance.content}`, require('@src/pages/content/components/content-app-wc').ContentAppWc);

customElements.define(`wc-${AppInstance.standalone}`, require('@src/components/web/standalone-app-wc').StandaloneAppWc);
/* eslint-enable @typescript-eslint/no-var-requires */

if (module.hot) module.hot.accept();
