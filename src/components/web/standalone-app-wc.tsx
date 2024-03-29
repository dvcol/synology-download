import createCache from '@emotion/cache';

import React from 'react';
import { render } from 'react-dom';

import { forkJoin, lastValueFrom } from 'rxjs';

import { StandaloneApp } from '@src/components';
import type { StoreOrProxy, Task } from '@src/models';
import { AppInstance, mapToTask, ServiceInstance } from '@src/models';
import { restoreLocalSate, restoreSettings, restoreTaskSlice } from '@src/pages/background/modules';
import type { StandaloneAppCredentials } from '@src/pages/web';
import { WcEvents } from '@src/pages/web';
import { BaseLoggerService, DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';
import { addTasks, setStandalone, syncConnection } from '@src/store/actions';
import { getConnection } from '@src/store/selectors';

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
    await this.init();
    this.render();
    this.attach();
    this.dispatchEvent(new CustomEvent(WcEvents.connected, { detail: this }));
  }

  private disconnectedCallback() {
    this.destroy();
    this.dispatchEvent(new CustomEvent(WcEvents.disconnected, { detail: this }));
  }

  private destroy() {
    PollingService.destroy();
    DownloadService.destroy();
    QueryService.destroy();
    NotificationService.destroy();
    LoggerService.destroy();
  }

  private async init(storeProxy: StoreOrProxy = store) {
    LoggerService.init({ store: storeProxy, source: ServiceInstance.Standalone });

    // Restore settings & polling
    await lastValueFrom(restoreSettings(store));

    NotificationService.init(storeProxy, ServiceInstance.Standalone, true);
    QueryService.init(storeProxy, ServiceInstance.Standalone);
    DownloadService.init(storeProxy);

    // Restore State
    await lastValueFrom(restoreLocalSate(store));

    // Restore Tasks
    await lastValueFrom(restoreTaskSlice(store));

    // Set standalone to open
    store.dispatch(setStandalone(true));

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

    return render(
      <StandaloneApp store={storeOrProxy} cache={cache} routerProps={{ basename: this.basename }} instance={AppInstance.standalone} />,
      app,
    );
  }

  /**
   * Add tasks to the store instance
   * @param tasks
   */
  add(tasks: Task | Task[]) {
    const _tasks = Array.isArray(tasks) ? tasks?.map(t => mapToTask(t)) : [mapToTask(tasks)];
    this.store.dispatch(addTasks(_tasks));
  }

  /**
   * Trigger a polling event
   */
  poll() {
    return lastValueFrom(forkJoin([QueryService.listTasks(), QueryService.getStatistic(), DownloadService.searchAll()]));
  }

  /**
   * Trigger a login event. Default login/pwd is admin/@dm1n.
   * @param credentials
   */
  login(credentials?: StandaloneAppCredentials) {
    const connection = getConnection(this.store.getState());
    const merged = { ...connection, ...credentials, password: credentials?.password ?? (connection.password || '@dm1n') };
    this.store.dispatch(syncConnection(merged));
    return lastValueFrom(QueryService.login(merged));
  }
}
