import createCache from '@emotion/cache';

import React from 'react';
import { render } from 'react-dom';

import { StandaloneApp } from '@src/components';
import { mockI18n } from '@src/mocks';
import type { StoreOrProxy } from '@src/models';
import { AppInstance, ServiceInstance } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

export class StandaloneAppWc extends HTMLElement {
  async connectedCallback() {
    await mockI18n();
    this.init();
    this.render();
  }

  init(storeProxy: StoreOrProxy = store) {
    LoggerService.init(storeProxy, ServiceInstance.Standalone);
    DownloadService.init(storeProxy);
    QueryService.init(storeProxy, ServiceInstance.Standalone);
    NotificationService.init(storeProxy, ServiceInstance.Standalone);
    PollingService.init(storeProxy);
  }

  get basename() {
    return this.getAttribute('basename') ?? undefined;
  }

  /**
   * Render the web component
   * @param root
   * @param storeOrProxy
   */
  render(root: Element = this, storeOrProxy: StoreOrProxy = store) {
    const shadowRoot = root.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
      <div id="${AppInstance.standalone}-container">
          <div id="${AppInstance.standalone}-app"></div>
      </div>
    `;

    const container = shadowRoot.querySelector(`#${AppInstance.standalone}-container`) as HTMLElement;
    const app = shadowRoot.querySelector(`#${AppInstance.standalone}-app`);
    const cache = createCache({ key: `${AppInstance.standalone}-cache`, container });

    return render(<StandaloneApp store={storeOrProxy} cache={cache} routerProps={{ basename: this.basename }} />, app);
  }
}
