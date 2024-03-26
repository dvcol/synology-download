import { AppInstance, ServiceInstance } from '@src/models';
import { initApp } from '@src/pages/common';
import { LoggerService } from '@src/services';
import { getPopup } from '@src/store/selectors';

const resizeContainer = () => {
  const root = document?.getElementById('synology-download-popup-app-container');

  if (!root) return;
  root.style.width = `${window.innerWidth}px`;
  root.style.height = `${window.innerHeight}px`;
};

initApp(ServiceInstance.Popup, AppInstance.popup, getPopup)
  .then(() => {
    resizeContainer();
    LoggerService.debug('Popup app initialised.');
  })
  .catch(err => LoggerService.debug('Popup app failed to initialised.', err));

if (module.hot) module.hot.accept();
