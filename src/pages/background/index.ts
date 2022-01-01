import { wrapStore } from 'webext-redux';
import { setOption, setPopup, store } from '../../store';
import { ChromeMessageType, ContextMenu, CreateTaskPayload, ModalInstance } from '../../models';
import { createContextMenu, NotificationService, PollingService, QueryService, removeContextMenu } from '../../services';
import { restoreSettings } from './modules/settings-handler';
import { onMessage } from '../../utils';

console.log('This is the background page.');

// Wrap proxy store see https://github.com/tshaddix/webext-redux
wrapStore(store);

// Set store to query service
QueryService.init(store);

// Init polling
PollingService.init(store);

// Init notifications
NotificationService.init(store);

// Restore settings & polling
restoreSettings();

// Listen to ports
// TODO: move to rxjs ?
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
onMessage([ChromeMessageType.createTask, ChromeMessageType.addMenu, ChromeMessageType.removeMenu], true).subscribe(
  ({ message: { type, payload }, sendResponse }) => {
    console.log('type', type);
    switch (type) {
      case ChromeMessageType.createTask:
        payload = payload as CreateTaskPayload;
        QueryService.createTask(payload.uri, payload.source).subscribe({
          next: () => sendResponse({ success: true, payload }),
          error: (error) => sendResponse({ success: false, error }),
        });
        break;
      case ChromeMessageType.addMenu:
        createContextMenu(payload as ContextMenu).subscribe({
          next: () => sendResponse({ success: true, payload }),
          error: (error) => sendResponse({ success: false, error }),
        });
        break;
      case ChromeMessageType.removeMenu:
        removeContextMenu(payload as string).subscribe({
          next: () => sendResponse({ success: true, payload }),
          error: (error) => sendResponse({ success: false, error }),
        });
        break;
    }
  }
);
