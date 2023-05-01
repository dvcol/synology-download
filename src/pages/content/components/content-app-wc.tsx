import createCache from '@emotion/cache';
import React from 'react';

import { render } from 'react-dom';

import type { StoreOrProxy } from '@src/models';
import { AppInstance, ServiceInstance } from '@src/models';
import { ContentApp } from '@src/pages/content/components/content-app';
import type { AnchorPayload, TaskDialogPayload } from '@src/pages/content/service';
import { anchor$, taskDialog$ } from '@src/pages/content/service';
import { WcEvents } from '@src/pages/web';
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
    this.dispatchEvent(new CustomEvent(WcEvents.connected, { detail: this }));
  }

  private disconnectedCallback() {
    this.dispatchEvent(new CustomEvent(WcEvents.disconnected, { detail: this }));
  }

  private init(storeProxy: StoreOrProxy = store) {
    LoggerService.init({ store: storeProxy, source: ServiceInstance.Content });
    NotificationService.init(storeProxy, ServiceInstance.Content, true);
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
   * @param instance
   */
  render(root: Element = this, storeOrProxy: StoreOrProxy = store, instance = AppInstance.content) {
    const shadowRoot = root.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
      <div id="${instance}-container">
          <div id="${instance}-app"></div>
      </div>
    `;

    const container = shadowRoot.querySelector(`#${instance}-container`) as HTMLElement;
    const app = shadowRoot.querySelector(`#${instance}-app`);
    const cache = createCache({ key: `${instance}-cache`, container });

    return render(<ContentApp storeOrProxy={storeOrProxy} cache={cache} container={container} instance={instance} />, app);
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
