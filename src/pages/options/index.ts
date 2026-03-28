import { AppInstance } from '../../models/app-instance.model';
import { AppRoute } from '../../models/routes.model';
import { ServiceInstance } from '../../models/settings.model';
import { LoggerService } from '../../services/logger/logger.service';
import { getOption } from '../../store/selectors/state.selector';
import { initApp } from '../common/init-app';

initApp(ServiceInstance.Option, AppInstance.option, getOption, AppRoute.Settings)
  .then(() => LoggerService.debug('Options app initialised.'))
  .catch(err => LoggerService.debug('Options app failed to initialised.', err));
