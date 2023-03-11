import { lastValueFrom } from 'rxjs';
import { wrapStore } from 'webext-redux';

import { ServiceInstance, StorePortName } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

import {
  onContentEvents,
  onContestMenuEvents,
  onDownloadEvents,
  onInstalledEvents,
  onPortEvents,
  restoreLocalSate,
  restoreSettings,
  restoreTasks,
} from './modules';

export const initServiceWorker = async () => {
  // Wrap proxy store see https://github.com/tshaddix/webext-redux
  wrapStore(store, {
    portName: StorePortName,
  });

  // initialize logger
  LoggerService.init(store, ServiceInstance.Background);

  // Listen to extension update -- needs to be early or else onInstalled fires too late
  onInstalledEvents(store);

  // Listen to context menu events (first because it is required for setting restore)
  onContestMenuEvents();

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
  await lastValueFrom(restoreTasks(store));

  // Listen to ports
  onPortEvents(store);

  // Content script listener
  onContentEvents(store);

  // Listen to download events
  onDownloadEvents(store);

  // Init polling
  PollingService.init(store);
};
