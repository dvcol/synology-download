import { wrapStore } from 'webext-redux';
import { setOption, setPopup } from '@src/store/actions';
import { store } from '@src/store';
import { ChromeMessageType, ContextMenu, ModalInstance } from '@src/models';
import { buildContextMenu, NotificationService, PollingService, QueryService, removeContextMenu, saveContextMenu } from '@src/services';
import { restoreSettings } from './modules/settings-handler';
import { onMessage } from '@src/utils';
import { Observable } from 'rxjs';
import { restoreTasks } from './modules/tasks-handler';

console.debug('Background service worker started.');

// Wrap proxy store see https://github.com/tshaddix/webext-redux
wrapStore(store);

// Set store to query service
QueryService.init(store);

// Init notifications
NotificationService.init(store);

// Init polling
PollingService.init(store);

// Restore settings & polling
restoreSettings();

// Restore Tasks
restoreTasks();

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
onMessage([ChromeMessageType.addMenu, ChromeMessageType.updateMenu, ChromeMessageType.removeMenu, ChromeMessageType.resetMenu]).subscribe(
  ({ message: { type, payload }, sendResponse }) => {
    const handle = <T>(obs$: Observable<T>) =>
      obs$.subscribe({
        next: () => {
          sendResponse({ success: true, payload });
        },
        error: (error) => sendResponse({ success: false, error }),
      });

    switch (type) {
      case ChromeMessageType.addMenu:
        handle(saveContextMenu(payload as ContextMenu));
        break;
      case ChromeMessageType.updateMenu:
        handle(saveContextMenu(payload as ContextMenu, true));
        break;
      case ChromeMessageType.removeMenu:
        handle(removeContextMenu(payload as string));
        break;
      case ChromeMessageType.resetMenu:
        handle(buildContextMenu(payload as ContextMenu[]));
        break;
    }
  }
);
