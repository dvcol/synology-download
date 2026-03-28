import type { StoreOrProxy } from '../../models/store.model';
import type { Task } from '../../models/task.model';
import type { StandaloneAppCredentials } from '../../pages/web/models/components.model';

import createCache from '@emotion/cache';
import React from 'react';
import { render } from 'react-dom';
import { forkJoin, lastValueFrom } from 'rxjs';

import { AppInstance } from '../../models/app-instance.model';
import { ServiceInstance } from '../../models/settings.model';
import { mapToTask } from '../../models/task.model';
import { restoreSettings } from '../../pages/background/modules/settings-handler';
import { restoreLocalSate } from '../../pages/background/modules/state-handler';
import { restoreTaskSlice } from '../../pages/background/modules/tasks-handler';
import { WcEvents } from '../../pages/web/models/components.model';
import { DownloadService } from '../../services/download/download.service';
import { BaseLoggerService } from '../../services/logger/base-logger.service';
import { LoggerService } from '../../services/logger/logger.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PollingService } from '../../services/polling/polling.service';
import { QueryService } from '../../services/query/query.service';
import { syncConnection } from '../../store/actions/settings.action';
import { setStandalone } from '../../store/actions/state.action';
import { addTasks } from '../../store/actions/tasks.action';
import { getConnection } from '../../store/selectors/settings.selector';
import { store } from '../../store/store';
import { StandaloneApp } from './standalone-app';

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
    void store.dispatch(setStandalone(true));

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

    // eslint-disable-next-line react-dom/no-render-return-value -- we need to return the rendered instance for web component usage
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
    void this.store.dispatch(addTasks(_tasks));
  }

  /**
   * Trigger a polling event
   */
  async poll() {
    return lastValueFrom(forkJoin([QueryService.listTasks(), QueryService.getStatistic(), DownloadService.searchAll()]));
  }

  /**
   * Trigger a login event. Default login/pwd is admin/@dm1n.
   * @param credentials
   */
  async login(credentials?: StandaloneAppCredentials) {
    const connection = getConnection(this.store.getState());
    const merged = { ...connection, ...credentials, password: credentials?.password ?? (connection.password || '@dm1n') };
    void this.store.dispatch(syncConnection(merged));
    return lastValueFrom(QueryService.login(merged));
  }
}
