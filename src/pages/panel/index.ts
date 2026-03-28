import { AppInstance } from '../../models/app-instance.model';
import { ServiceInstance } from '../../models/settings.model';
import { LoggerService } from '../../services/logger/logger.service';
import { getPanel } from '../../store/selectors/state.selector';
import { initApp } from '../common/init-app';

initApp(ServiceInstance.Panel, AppInstance.panel, getPanel)
  .then(() => LoggerService.debug('Panel app initialised.'))
  .catch(err => LoggerService.debug('Panel app failed to initialised.', err));
