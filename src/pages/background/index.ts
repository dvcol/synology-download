import { wrapStore } from 'webext-redux';
import { setOption, setPopup, store } from '../../store';
import { ChromeMessage, ChromeMessageType, ContextMenuOption, CreateTaskPayload, ModalInstance } from '../../models';
import { createContextMenu, PollingService, QueryService, removeContextMenu } from '../../services';
import { restoreSettings } from './modules/settings-handler';

console.log('This is the background page.');

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
    store.dispatch(setPopup(true));
    port.onDisconnect.addListener(() => {
      store.dispatch(setPopup(false));
    });
  } else if (ModalInstance.option.toString() === port.name) {
    store.dispatch(setOption(true));
    port.onDisconnect.addListener(() => {
      store.dispatch(setOption(false));
    });
  }
});

// On message from chrome handle payload
chrome.runtime.onMessage.addListener((request: ChromeMessage) => {
  if (request.type === ChromeMessageType.createTask) {
    console.log(request.payload);
    const { uri, source } = request.payload as CreateTaskPayload;
    QueryService.createTask(uri, source).subscribe();
  } else if (request.type === ChromeMessageType.addMenu) {
    console.log('message addMenu', request);
    createContextMenu(request.payload as ContextMenuOption);
  } else if (request.type === ChromeMessageType.removeMenu) {
    console.log('message removeMenu', request);
    removeContextMenu(request.payload as string);
  }
});
