import { LoggerService } from '../../services/logger/logger.service';
import { injectContentApp } from './modules/inject-content-app';

void injectContentApp()
  .catch(err => LoggerService.error('Content script component failed to rendered.', err))
  .then(() => LoggerService.debug('Content script component rendered.'));
