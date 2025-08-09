import { AppInstance, ServiceInstance } from '@src/models';
import { initApp } from '@src/pages/common';
import { LoggerService } from '@src/services';
import { getPopup } from '@src/store/selectors';
import { isMacOs } from '@src/utils';

const resizeContainer = () => {
  const root = document?.getElementById('synology-download-popup-app-container');

  if (!root) return;

  if (!isMacOs()) {
    root.style.maxWidth = `720px`;
    root.style.maxHeight = `592px`;
  }

  root.style.width = `${window.innerWidth}px`;
  root.style.height = `${window.innerHeight}px`;
};

initApp(ServiceInstance.Popup, AppInstance.popup, getPopup)
  .then(() => {
    resizeContainer();
    LoggerService.debug('Popup app initialised.');
  })
  .catch(err => LoggerService.debug('Popup app failed to initialised.', err));
