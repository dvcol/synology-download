import { wrapStore } from 'webext-redux';
import { setOption, setPopup, store } from '../../store';
import { ChromeMessageType, ModalInstance } from '../../models';
import { createContextMenu, PollingService, QueryService, removeContextMenu } from '../../services';
import { restoreSettings } from './modules/settings-handler';

console.log('This is the background page.');
console.log('Put the background scripts here.');

// Wrap proxy store see https://github.com/tshaddix/webext-redux
wrapStore(store);

// Set store to query service
QueryService.init(store);

// Init polling
PollingService.init(store);

// Restore settings & polling
restoreSettings();

// Listen to ports
chrome.runtime.onConnect.addListener((port) => {
  if (ModalInstance.popup.toString() === port.name) {
    console.log('opening popup', port.name);
    store.dispatch(setPopup(true));
    port.onDisconnect.addListener(() => {
      console.log('closing popup', port.name);
      store.dispatch(setPopup(false));
    });
  } else if (ModalInstance.option.toString() === port.name) {
    store.dispatch(setOption(true));
    port.onDisconnect.addListener(() => {
      console.log('opening option', port.name);
      console.log('closing option', port.name);
      store.dispatch(setOption(false));
    });
  }
});

// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: any) => {
  if (request.type === ChromeMessageType.link) {
    console.log(request.payload);
    QueryService.createTask(request.payload).subscribe();
  } else if (request.type === ChromeMessageType.addMenu) {
    console.log('message addMenu', request);
    createContextMenu(request.payload);
  } else if (request.type === ChromeMessageType.removeMenu) {
    console.log('message removeMenu', request);
    removeContextMenu(request.payload);
  }
});
