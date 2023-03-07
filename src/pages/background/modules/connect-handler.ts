import { tap } from 'rxjs';

import { ChromeMessageType, ModalInstance } from '@src/models';
import { LoggerService } from '@src/services';
import { setContentDialog, setContentMenu, setOption, setPopup } from '@src/store/actions';
import { onConnect, onMessage } from '@src/utils';

import type { Store } from 'redux';

const onAppConnect = (store: Store, instance: ModalInstance, dispatch: typeof setOption | typeof setPopup) =>
  onConnect([instance]).pipe(
    tap(port => {
      LoggerService.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, timestamp: new Date().toISOString() });

      // dispatch connect
      store.dispatch(dispatch(true));

      // disconnect listener
      port.onDisconnect.addListener(() => {
        LoggerService.debug(`disconnecting ${port.name}`, new Date().toISOString());

        // dispatch disconnect
        store.dispatch(dispatch(false));
      });
    }),
  );

/** Listen to onConnect events to handle port connections */
export const onPortEvents = (store: Store) => {
  LoggerService.debug('Subscribing to ports events.');

  // Dropdown popup
  onAppConnect(store, ModalInstance.popup, setPopup).subscribe();

  // Option page
  onAppConnect(store, ModalInstance.option, setOption).subscribe();

  // Content script
  onConnect([ModalInstance.modal]).subscribe(port => {
    LoggerService.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, source: port?.sender?.origin, timestamp: new Date().toISOString() });
    /**
     * TODO: Remove if/when persistent MV3 service worker are introduced
     *
     * Disconnect port just before 5 minutes timeout to keep service worker alive
     * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255
     * @see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
     */
    setTimeout(() => {
      LoggerService.debug(`disconnecting ${port.name}`, new Date().toISOString());
      port.disconnect();
    }, 295e3);
  });
};

export const onContentEvents = (store: Store) => {
  LoggerService.debug('Subscribing to content menu events.');

  onMessage<boolean>([ChromeMessageType.contentMenuOpen]).subscribe(({ message: { payload } }) => {
    LoggerService.debug('Content menu open', payload);
    store.dispatch(setContentMenu(!!payload));
  });
  onMessage<boolean>([ChromeMessageType.contentDialogOpen]).subscribe(({ message: { payload } }) => {
    LoggerService.debug('Content dialog open', payload);
    store.dispatch(setContentDialog(!!payload));
  });
};
