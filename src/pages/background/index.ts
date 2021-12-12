import { wrapStore } from 'webext-redux';
import { setOption, setPopup, store } from '../../store';
import { ChromeMessage, ChromeMessageType, ContextMenuOption, CreateTaskPayload, ModalInstance } from '../../models';
import { createContextMenu, NotificationService, PollingService, QueryService, removeContextMenu } from '../../services';
import { restoreSettings } from './modules/settings-handler';

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
chrome.runtime.onMessage.addListener(({ type, payload }: ChromeMessage) => {
  switch (type) {
    case ChromeMessageType.createTask:
      payload = payload as CreateTaskPayload;
      QueryService.createTask(payload.uri, payload.source).subscribe();
      break;
    case ChromeMessageType.addMenu:
      console.debug('message addMenu', type, payload);
      createContextMenu(payload as ContextMenuOption);
      break;
    case ChromeMessageType.removeMenu:
      console.log('message removeMenu', type, payload);
      removeContextMenu(payload as string);
      break;
  }
});
