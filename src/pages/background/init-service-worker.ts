import { lastValueFrom } from 'rxjs';
import { wrapStore } from 'webext-redux';

import { ServiceInstance } from '../../models/settings.model';
import { StorePortName } from '../../models/store.model';
import { DownloadService } from '../../services/download/download.service';
import { LoggerService } from '../../services/logger/logger.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PollingService } from '../../services/polling/polling.service';
import { QueryService } from '../../services/query/query.service';
import { store } from '../../store/store';
import { onContentEvents, onPortEvents } from './modules/connect-handler';
import { onContextMenuEvents } from './modules/context-menu.handler';
import { onDownloadEvents } from './modules/download.handler';
import { onOpenPanelEvent } from './modules/panel-handler';
import { onOpenPopupEvent } from './modules/popup-handler';
import { onScrapedContentEvent } from './modules/scraped.handler';
import { restoreSettings } from './modules/settings-handler';
import { restoreLocalSate } from './modules/state-handler';
import { restoreTaskSlice } from './modules/tasks-handler';
import { onInstalledEvents } from './modules/update-handler';

export async function initServiceWorker() {
  // Wrap proxy store see https://github.com/tshaddix/webext-redux
  wrapStore(store, {
    portName: StorePortName,
  });

  // initialize logger
  LoggerService.init({ store, source: ServiceInstance.Background });

  // Listen to extension update -- needs to be early or else onInstalled fires too late
  onInstalledEvents(store);

  // Listen to context menu events (first because it is required for setting restore)
  onContextMenuEvents();

  // Listen to scrapped events
  onScrapedContentEvent(store);

  // Restore settings & polling
  await lastValueFrom(restoreSettings(store));

  // Init notifications
  NotificationService.init(store, ServiceInstance.Background);

  // Set store to query service
  QueryService.init(store, ServiceInstance.Background);

  // Set store to download service
  DownloadService.init(store);

  // Restore State
  await lastValueFrom(restoreLocalSate(store));

  // Restore Tasks
  await lastValueFrom(restoreTaskSlice(store));

  // Listen to ports
  onPortEvents(store);

  // Content script listener
  onContentEvents(store);

  // Listen to download events
  onDownloadEvents(store);

  // Listen to popup events
  onOpenPopupEvent();

  // Listen to panel events
  onOpenPanelEvent(store);

  // Init polling
  PollingService.init(store);
}
