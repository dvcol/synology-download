import { wrapStore } from 'webext-redux';

import { DownloadService, NotificationService, PollingService, QueryService } from '@src/services';
import { store } from '@src/store';

import { onMessageEvents, portListener, restoreSettings, restoreTasks } from './modules';

console.debug('Background service worker started.');

// Listen to ports
portListener();

// Listen to context menu events
onMessageEvents();

// Wrap proxy store see https://github.com/tshaddix/webext-redux
wrapStore(store);

// Set store to download service
DownloadService.init(store);

// Set store to query service
QueryService.init(store);

// Init notifications
NotificationService.init(store);

// Init polling
PollingService.init(store);

// Restore settings & polling
restoreSettings();

// Restore Tasks
restoreTasks();
