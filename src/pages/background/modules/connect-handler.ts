import { ModalInstance } from '@src/models';
import { store } from '@src/store';
import { setOption, setPopup } from '@src/store/actions';

/** Listen to onConnect events to handle port connections */
export const onConnect = () => {
  // TODO: move to rxjs ?
  chrome.runtime.onConnect.addListener((port) => {
    switch (port.name) {
      // Dropdown popup
      case ModalInstance.popup:
        store.dispatch(setPopup(true));
        port.onDisconnect.addListener(() => {
          store.dispatch(setPopup(false));
        });
        break;
      // Option page
      case ModalInstance.option:
        store.dispatch(setOption(true));
        port.onDisconnect.addListener(() => {
          store.dispatch(setOption(false));
        });
        break;
      // Content script
      case ModalInstance.modal:
        console.debug(`connecting ${port.name}`, new Date().toISOString());
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

        break;
    }
  });
};
