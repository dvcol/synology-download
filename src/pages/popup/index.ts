import { AppInstance } from '../../models/app-instance.model';
import { ServiceInstance } from '../../models/settings.model';
import { LoggerService } from '../../services/logger/logger.service';
import { getPopup } from '../../store/selectors/state.selector';
import { isMacOs } from '../../utils/webex.utils';
import { initApp } from '../common/init-app';

function resizeContainer() {
  const root = document?.getElementById('synology-download-popup-app-container');

  if (!root) return;

  if (!isMacOs()) {
    root.style.maxWidth = '720px';
    root.style.maxHeight = '592px';
  }

  root.style.width = `${window.innerWidth}px`;
  root.style.height = `${window.innerHeight}px`;
}

initApp(ServiceInstance.Popup, AppInstance.popup, getPopup)
  .then(() => {
    resizeContainer();
    LoggerService.debug('Popup app initialised.');
  })
  .catch(err => LoggerService.debug('Popup app failed to initialised.', err));
