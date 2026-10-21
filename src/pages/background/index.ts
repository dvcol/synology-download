import { LoggerService } from '../../services/logger/logger.service';
import { initServiceWorker } from './init-service-worker';
import { registerPollingAlarm } from './modules/polling-alarm';

registerPollingAlarm();

LoggerService.debug('Background service worker injected.');

initServiceWorker()
  .then(() => LoggerService.debug('Background service worker initialized.'))
  .catch(err => LoggerService.error('Background service worker failed to initialized.', err));
