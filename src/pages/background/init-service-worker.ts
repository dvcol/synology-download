import { lastValueFrom } from 'rxjs';
import { wrapStore } from 'webext-redux';

import { LogInstance } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

import {
  onContentEvents,
  onDownloadEvents,
  onInstalledEvents,
  onMessageEvents,
  onPortEvents,
  restoreLocalSate,
  restoreSettings,
  restoreTasks,
} from './modules';

export const initServiceWorker = async () => {
  // Wrap proxy store see https://github.com/tshaddix/webext-redux
  wrapStore(store);

  // initialize logger
  LoggerService.init(store, LogInstance.Background);

  // Listen to context menu events (first because it is required for setting restore)
  onMessageEvents();

  // Restore settings & polling
  await lastValueFrom(restoreSettings(store));

  // Init notifications
  NotificationService.init(store);

  // Set store to query service
  QueryService.init(store);

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

  // Init polling
  PollingService.init(store);

  // Listen to download events
  onDownloadEvents(store);

  // Listen to extension update
  onInstalledEvents(store);
};
