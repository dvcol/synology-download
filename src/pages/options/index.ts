import { AppInstance, AppRoute, ServiceInstance } from '@src/models';
import { initApp } from '@src/pages/common';
import { LoggerService } from '@src/services';
import { getOption } from '@src/store/selectors';

initApp(ServiceInstance.Option, AppInstance.option, getOption, AppRoute.Settings)
  .then(() => LoggerService.debug('Options app initialised.'))
  .catch(err => LoggerService.debug('Options app failed to initialised.', err));

if (module.hot) module.hot.accept();
