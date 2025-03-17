import { AppInstance, ServiceInstance } from '@src/models';
import { initApp } from '@src/pages/common';
import { LoggerService } from '@src/services';
import { getPanel } from '@src/store/selectors';

initApp(ServiceInstance.Panel, AppInstance.panel, getPanel)
  .then(() => LoggerService.debug('Panel app initialised.'))
  .catch(err => LoggerService.debug('Panel app failed to initialised.', err));

if (module.hot) module.hot.accept();
