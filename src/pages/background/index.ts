import { LoggerService } from '@src/services';

import { initServiceWorker } from './init-service-worker';

LoggerService.debug('Background service worker injected.');

initServiceWorker()
  .then(() => LoggerService.debug('Background service worker initialized.'))
  .catch(err => LoggerService.error('Background service worker failed to initialized.', err));
