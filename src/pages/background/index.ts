import { LoggerService } from '../../services/logger/logger.service';
import { initServiceWorker } from './init-service-worker';

LoggerService.debug('Background service worker injected.');

/**
 * Periodic alarm to wake the MV3 service worker so polling and notifications
 * resume even when no tab is holding a port open. Listener must be registered
 * synchronously at top level or Chrome will not wake the worker for it.
 * Chrome enforces a 30s minimum period.
 */
const KEEP_ALIVE_ALARM = 'synology-download-keep-alive';
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name === KEEP_ALIVE_ALARM) LoggerService.debug('Keep-alive alarm fired.');
});
void chrome.alarms?.create(KEEP_ALIVE_ALARM, { periodInMinutes: 0.5 });

initServiceWorker()
  .then(() => LoggerService.debug('Background service worker initialized.'))
  .catch(err => LoggerService.error('Background service worker failed to initialized.', err));
