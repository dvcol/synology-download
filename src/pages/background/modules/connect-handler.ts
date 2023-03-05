import { ChromeMessageType, ModalInstance } from '@src/models';
import { setContentDialog, setContentMenu, setOption, setPopup } from '@src/store/actions';
import { onConnect, onMessage } from '@src/utils';

import type { Store } from 'redux';

/** Listen to onConnect events to handle port connections */
export const onPortEvents = (store: Store) => {
  // Dropdown popup
  onConnect([ModalInstance.popup]).subscribe(port => {
    store.dispatch(setPopup(true));
    console.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, timestamp: new Date().toISOString() });
    port.onDisconnect.addListener(() => {
      console.debug(`disconnecting ${port.name}`, new Date().toISOString());
      store.dispatch(setPopup(false));
    });
  });

  // Option page
  onConnect([ModalInstance.option]).subscribe(port => {
    store.dispatch(setOption(true));
    console.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, timestamp: new Date().toISOString() });
    port.onDisconnect.addListener(() => {
      console.debug(`disconnecting ${port.name}`, new Date().toISOString());
      store.dispatch(setOption(false));
    });
  });

  // Content script
  onConnect([ModalInstance.modal]).subscribe(port => {
    console.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, source: port?.sender?.origin, timestamp: new Date().toISOString() });
    /**
     * TODO: Remove if/when persistent MV3 service worker are introduced
     *
     * Disconnect port just before 5 minutes timeout to keep service worker alive
     * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255
     * @see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
     */
    setTimeout(() => {
      console.debug(`disconnecting ${port.name}`, new Date().toISOString());
      port.disconnect();
    }, 295e3);
  });
};

export const onContentEvents = (store: Store) => {
  onMessage<boolean>([ChromeMessageType.contentMenuOpen]).subscribe(({ message: { payload } }) => {
    console.debug('Content menu open', payload);
    store.dispatch(setContentMenu(!!payload));
  });
  onMessage<boolean>([ChromeMessageType.contentDialogOpen]).subscribe(({ message: { payload } }) => {
    console.debug('Content dialog open', payload);
    store.dispatch(setContentDialog(!!payload));
  });
};
