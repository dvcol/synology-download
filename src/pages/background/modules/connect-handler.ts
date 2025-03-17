import { tap } from 'rxjs';

import { AppInstance, ChromeMessageType } from '@src/models';
import { LoggerService } from '@src/services';
import { resetLoading, setContentDialog, setContentMenu, setOption, setPanel, setPopup } from '@src/store/actions';
import { onConnect, onMessage } from '@src/utils';

import type { Store } from 'redux';

const onAppConnect = (store: Store, instance: AppInstance, dispatch: typeof setOption | typeof setPopup | typeof setPanel) =>
  onConnect([instance]).pipe(
    tap(port => {
      LoggerService.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, name: port.name });

      // dispatch connect
      store.dispatch(dispatch(true));

      // disconnect listener
      port.onDisconnect.addListener(() => {
        LoggerService.debug(`disconnecting ${port.name}`);

        // dispatch disconnect
        store.dispatch(dispatch(false));

        // clear loading
        store.dispatch(resetLoading());
      });
    }),
  );

/** Listen to onConnect events to handle port connections */
export const onPortEvents = (store: Store) => {
  LoggerService.debug('Subscribing to ports events.');

  // Dropdown popup
  onAppConnect(store, AppInstance.popup, setPopup).subscribe();

  // Panel page
  onAppConnect(store, AppInstance.panel, setPanel).subscribe();

  // Option page
  onAppConnect(store, AppInstance.option, setOption).subscribe();

  // Content script
  onConnect([AppInstance.content]).subscribe(port => {
    LoggerService.debug(`connecting ${port.name}`, { id: port?.sender?.tab?.id, source: port?.sender?.origin, name: port.name });
    /**
     * TODO: Remove if/when persistent MV3 service worker are introduced
     *
     * Disconnect port just before 5 minutes timeout to keep service worker alive
     * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255
     * @see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
     */
    setTimeout(() => {
      LoggerService.debug(`disconnecting ${port.name}`);
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
