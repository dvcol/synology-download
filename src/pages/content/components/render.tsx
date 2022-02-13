import React from 'react';
import { render } from 'react-dom';
import { storeProxy } from '@src/store';
import { NotificationService, QueryService } from '@src/services';
import { ModalInstance } from '@src/models';
import createCache from '@emotion/cache';
import { ContentApp } from '@src/pages/content/components';

/**
 * Open a modal popup for complex download actions
 */
export const renderContentApp = () => {
  // Create a root element to host app
  const root = document.createElement('div');
  root.id = `${ModalInstance.modal}-root`;
  root.style.all = 'initial';
  document.body.appendChild(root);

  // Create shadow root to isolate styles
  const shadowRoot = root.attachShadow({ mode: 'closed' });
  shadowRoot.innerHTML = `
    <div id="${ModalInstance.modal}-container">
        <div id="${ModalInstance.modal}-app"></div>
    </div>`;

  const app = shadowRoot.querySelector(`#${ModalInstance.modal}-app`);
  const container = shadowRoot.querySelector(`#${ModalInstance.modal}-container`) as HTMLElement;
  const cache = createCache({ key: `${ModalInstance.modal}-cache`, container });

  /**
   * TODO: Remove if/when persistent MV3 service worker are introduced
   *
   * Refresh connection port to service worker to keep it alive
   * @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255
   * @see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
   */
  const connect = () => {
    console.debug(`connecting ${ModalInstance.modal}`, new Date().toISOString());
    chrome.runtime.connect({ name: ModalInstance.modal }).onDisconnect.addListener(connect);
  };

  storeProxy
    .ready()
    .then(() => {
      // Pass store to services and init
      QueryService.init(storeProxy, true);
      NotificationService.init(storeProxy, true);
      // Register as open
      connect();
    })
    .then(() => render(<ContentApp store={storeProxy} cache={cache} container={container} />, app));
};
