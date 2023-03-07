import { initServiceWorker } from './init-service-worker';

console.debug('Background service worker injected.');

initServiceWorker()
  .then(() => console.debug('Background service worker initialized.'))
  .catch(err => console.error('Background service worker failed to initialized.', err));
