import createCache from '@emotion/cache';

import React from 'react';

import { render } from 'react-dom';

import { getManifest } from '@dvcol/web-extension-utils';

import { ModalInstance } from '@src/models';
import { ContentApp } from '@src/pages/content/components';
import { onClickEventListener } from '@src/pages/content/modules';
import { NotificationService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { portConnect } from '@src/utils';

const { name, version } = getManifest();
const injection = new Date().toISOString();

console.debug('Content script injected.', { name, version, injection });

const rootContainerId = `${ModalInstance.modal}-root`;
const destroyEvent = 'onDestroy';

/**
 * Open a modal popup for custom download actions
 */
export const renderContentApp = () => {
  const previous = document.body.querySelectorAll(`#${rootContainerId}`);
  if (previous?.length) {
    console.debug(`Found exiting instance of '${rootContainerId}'`, previous);
    previous?.forEach(el => {
      el.dispatchEvent(new CustomEvent(destroyEvent));
      document.body.removeChild(el);
    });
  }

  // Create a root element to host app
  const root = document.createElement('div');
  root.id = rootContainerId;
  root.dataset.version = version;
  root.dataset.injection = injection;
  root.dataset.context = 'content-script';
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
    portConnect({ name: ModalInstance.modal }).onDisconnect.addListener(connect);
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

  // Attach click listener
  const sub = onClickEventListener();

  root.addEventListener(destroyEvent, () => {
    console.debug(`Unsubscribing to events from '${rootContainerId}'`, { version, injection });
    sub.unsubscribe();
  });
};
