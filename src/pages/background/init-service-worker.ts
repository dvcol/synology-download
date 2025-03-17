import { lastValueFrom } from 'rxjs';
import { wrapStore } from 'webext-redux';

import { ServiceInstance, StorePortName } from '@src/models';
import { onOpenPanelEvent } from '@src/pages/background/modules/panel-handler';
import { onOpenPopupEvent } from '@src/pages/background/modules/popup-handler';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

import {
  onContentEvents,
  onContextMenuEvents,
  onDownloadEvents,
  onInstalledEvents,
  onPortEvents,
  onScrapedContentEvent,
  restoreLocalSate,
  restoreSettings,
  restoreTaskSlice,
} from './modules';

export const initServiceWorker = async () => {
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
};
