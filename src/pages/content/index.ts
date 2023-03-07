import { LoggerService } from '@src/services';

import { renderContentApp } from './components/render';

renderContentApp()
  .then(() => LoggerService.debug('Content script component rendered.'))
  .catch(err => LoggerService.error('Content script component failed to rendered.', err));
