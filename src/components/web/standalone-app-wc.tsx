import createCache from '@emotion/cache';

import React from 'react';
import { render } from 'react-dom';

import { StandaloneApp } from '@src/components';
import type { StoreOrProxy, Task } from '@src/models';
import { AppInstance, mapToTask, ServiceInstance } from '@src/models';
import { BaseLoggerService, DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';
import { addTasks } from '@src/store/actions';

export class StandaloneAppWc extends HTMLElement {
  get store() {
    return store;
  }

  get logger() {
    return BaseLoggerService;
  }

  get basename() {
    return this.getAttribute('basename') ?? undefined;
  }

  private async connectedCallback() {
    this.init();
    this.render();
    this.attach();
  }

  private init(storeProxy: StoreOrProxy = store) {
    LoggerService.init({ store: storeProxy, source: ServiceInstance.Standalone });
    DownloadService.init(storeProxy);
    QueryService.init(storeProxy, ServiceInstance.Standalone);
    NotificationService.init(storeProxy, ServiceInstance.Standalone);
    PollingService.init(storeProxy);
  }

  private attach() {
    if (!window._synology) window._synology = {};
    window._synology.standalone = this;
  }

  /**
   * Render the web component
   * @param root
   * @param storeOrProxy
   */
  render(root: Element = this, storeOrProxy: StoreOrProxy = store) {
    const shadowRoot = root.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
      <div id="${AppInstance.standalone}-container" style="height: 100%">
          <div id="${AppInstance.standalone}-app" style="height: 100%"></div>
      </div>
    `;

    const container = shadowRoot.querySelector(`#${AppInstance.standalone}-container`) as HTMLElement;
    const app = shadowRoot.querySelector(`#${AppInstance.standalone}-app`);
    const cache = createCache({ key: `${AppInstance.standalone}-cache`, container });

    return render(<StandaloneApp store={storeOrProxy} cache={cache} routerProps={{ basename: this.basename }} />, app);
  }

  /**
   * Add tasks to the store instance
   * @param tasks
   */
  add(tasks: Task | Task[]) {
    const _tasks = Array.isArray(tasks) ? tasks?.map(t => mapToTask(t)) : [mapToTask(tasks)];
    this.store.dispatch(addTasks(_tasks));
  }
}
