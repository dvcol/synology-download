import { injectContentApp } from '@src/pages/content/modules';
import { LoggerService } from '@src/services';

injectContentApp()
  .catch(err => LoggerService.error('Content script component failed to rendered.', err))
  .then(() => LoggerService.debug('Content script component rendered.'));
