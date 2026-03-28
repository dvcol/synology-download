import type { Root } from 'react-dom/client';

import type { StoreOrProxy } from '../../../models/store.model';
import type { AnchorPayload } from '../service/anchor.service';
import type { TaskDialogPayload } from '../service/dialog.service';

import createCache from '@emotion/cache';
import { createRoot } from 'react-dom/client';

import { AppInstance } from '../../../models/app-instance.model';
import { ServiceInstance } from '../../../models/settings.model';
import { DownloadService } from '../../../services/download/download.service';
import { BaseLoggerService } from '../../../services/logger/base-logger.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { PollingService } from '../../../services/polling/polling.service';
import { QueryService } from '../../../services/query/query.service';
import { store } from '../../../store/store';
import { WcEvents } from '../../web/models/components.model';
import { anchor$ } from '../service/anchor.service';
import { taskDialog$ } from '../service/dialog.service';
import { ContentApp } from './content-app';

export class ContentAppWc extends HTMLElement {
  private _root: Root | undefined;

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
    this._root?.unmount();
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

    this._root = createRoot(app!);
    this._root.render(<ContentApp storeOrProxy={storeOrProxy} cache={cache} container={container} instance={instance} />);
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
