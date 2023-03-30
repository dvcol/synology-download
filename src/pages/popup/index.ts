import { AppInstance, ServiceInstance } from '@src/models';
import { initApp } from '@src/pages/common';
import { LoggerService } from '@src/services';
import { getPopup } from '@src/store/selectors';

initApp(ServiceInstance.Popup, AppInstance.popup, getPopup)
  .then(() => LoggerService.debug('Popup app initialised.'))
  .catch(err => LoggerService.debug('Popup app failed to initialised.', err));

if (module.hot) module.hot.accept();
