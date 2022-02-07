import React from 'react';
import { render } from 'react-dom';
import { proxyStore } from '@src/store';
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

  proxyStore
    .ready()
    .then(() => {
      // Pass store to services and init
      QueryService.init(proxyStore, true);
      NotificationService.init(proxyStore, true);
      // Register as open
      chrome.runtime.connect({ name: ModalInstance.modal });
    })
    .then(() => render(<ContentApp store={proxyStore} cache={cache} container={container} />, app));
};
