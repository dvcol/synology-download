import createCache from '@emotion/cache';

import React from 'react';

import { render } from 'react-dom';

import { getManifest } from '@dvcol/web-extension-utils';

import { ModalInstance } from '@src/models';
import { ContentApp } from '@src/pages/content/components';
import { onClickEventListener } from '@src/pages/content/modules';
import { NotificationService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { portConnect, purgeEmotionContext } from '@src/utils';

const { name, version } = getManifest();
const injection = new Date().toISOString();

console.debug('Content script injected.', { name, version, injection });

const rootContainerId = `${ModalInstance.modal}-root`;
const onDestroyEvent = 'onDestroy';
const destroyedEvent = 'destroyed';

/**
 * Emits 'onDestroy' event on component and await 'destroyed 'callback before resolving
 * @param el the element on which to call 'onDestroy'
 */
const waitDestroyed = (el: Element): Promise<void> => {
  let resolve: () => void;
  const promise = new Promise<void>(_resolve => {
    resolve = () => _resolve();
  });
  el.addEventListener(destroyedEvent, () => resolve());
  el.dispatchEvent(new CustomEvent(onDestroyEvent));
  el.parentElement?.removeChild(el);
  return promise;
};

/**
 * Remove old instances of the component and trigger destroy lifecycle
 */
export const removeOldInstances = (): Promise<void | void[]> => {
  const previous = document.body.querySelectorAll(`#${rootContainerId}`);
  if (previous?.length) {
    console.debug(`Found exiting instance of '${rootContainerId}'`, previous);
    return Promise.all([...previous]?.map(el => waitDestroyed(el)));
  }
  return Promise.resolve();
};

/**
 * Open a modal popup for custom download actions
 */
export const renderContentApp = async (): Promise<void> => {
  // purging old instances
  await removeOldInstances();

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

  // Attach click listener
  const sub = onClickEventListener();
  root.addEventListener(onDestroyEvent, () => {
    console.debug(`Unsubscribing to events from '${rootContainerId}'.`, { version, injection });
    sub.unsubscribe();
    purgeEmotionContext();
    root.dispatchEvent(new CustomEvent(destroyedEvent));
  });

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

  return storeProxy
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
