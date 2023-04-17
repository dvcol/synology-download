import createCache from '@emotion/cache';
import React from 'react';

import { render } from 'react-dom';

import type { StoreOrProxy } from '@src/models';
import { AppInstance, ServiceInstance } from '@src/models';
import { ContentApp } from '@src/pages/content/components/content-app';
import type { AnchorPayload, TaskDialogPayload } from '@src/pages/content/service';
import { anchor$, taskDialog$ } from '@src/pages/content/service';
import { BaseLoggerService, DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

export class ContentAppWc extends HTMLElement {
  get store() {
    return store;
  }

  get logger() {
    return BaseLoggerService;
  }

  private connectedCallback() {
    this.init();
    this.render();
    this.attach();
  }

  private init(storeProxy: StoreOrProxy = store) {
    LoggerService.init({ store: storeProxy, source: ServiceInstance.Content });
    NotificationService.init(storeProxy, ServiceInstance.Content);
    QueryService.init(storeProxy, ServiceInstance.Content);
    DownloadService.init(storeProxy);
    PollingService.init(storeProxy);
  }

  private attach() {
    if (!window._synology) window._synology = {};
    window._synology.content = this;
  }

  /**
   * Render the web component
   * @param root
   * @param storeOrProxy
   */
  render(root: Element = this, storeOrProxy: StoreOrProxy = store) {
    const shadowRoot = root.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
      <div id="${AppInstance.content}-container">
          <div id="${AppInstance.content}-app"></div>
      </div>
    `;

    const container = shadowRoot.querySelector(`#${AppInstance.content}-container`) as HTMLElement;
    const app = shadowRoot.querySelector(`#${AppInstance.content}-app`);
    const cache = createCache({ key: `${AppInstance.content}-cache`, container });

    return render(<ContentApp storeOrProxy={storeOrProxy} cache={cache} container={container} />, app);
  }

  /**
   * Open quick menu dialog by dispatching a click event
   * @param payload
   */
  anchor(payload: AnchorPayload) {
    anchor$.next(payload);
  }

  /**
   * Open task dialog by dispatching a task event
   * @param payload
   */
  dialog(payload: TaskDialogPayload) {
    taskDialog$.next(payload);
  }
}
