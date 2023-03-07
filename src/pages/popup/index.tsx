import React from 'react';

import { render } from 'react-dom';

import { App } from '@src/components';
import { ModalInstance } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { store$, storeProxy } from '@src/store';
import { getPopup } from '@src/store/selectors';
import { portConnect } from '@src/utils';

const initOptionsApp = async () => {
  await storeProxy.ready();

  // Pass store to service and init
  LoggerService.init(storeProxy);
  DownloadService.init(storeProxy, true);
  QueryService.init(storeProxy, true);
  NotificationService.init(storeProxy, true);
  PollingService.init(storeProxy, true);

  // Register as open
  portConnect({ name: ModalInstance.popup });

  // attempt auto-login on open
  store$<boolean>(storeProxy, getPopup).subscribe(open => {
    if (open && QueryService.isReady) QueryService.autoLogin().subscribe();
  });

  // Render the app
  render(<App store={storeProxy} />, window.document.querySelector('#synology-download-popup-app-container'));
};

initOptionsApp()
  .then(() => console.debug('Popup app initialised.'))
  .catch(err => console.debug('Popup app failed to initialised.', err));

if (module.hot) module.hot.accept();
