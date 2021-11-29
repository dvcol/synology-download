import { wrapStore } from 'webext-redux';
import { store } from '../../store';
import { ChromeMessageType } from '../../models';
import { createContextMenu, removeContextMenu, synologyClient } from '../../services';
import { restoreSettings } from './modules/settings-handler';

console.log('This is the background page.');
console.log('Put the background scripts here.');

// Wrap proxy store see https://github.com/tshaddix/webext-redux
wrapStore(store);

// Restore settings & polling
restoreSettings();

// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any) => {
  console.log(request);
  if (request.type === ChromeMessageType.link) {
    console.log(request.payload);
    // TODO notification
    synologyClient.createTask(request.payload).subscribe({
      complete: () => console.info('suces created'),
      error: (err) => console.error(err),
    });
  } else if (request.type === ChromeMessageType.addMenu) {
    console.log('message addMenu', request);
    createContextMenu(request.payload);
  } else if (request.type === ChromeMessageType.removeMenu) {
    console.log('message removeMenu', request);
    removeContextMenu(request.payload);
  }
});
