import React from 'react';

import { render } from 'react-dom';

import { App } from '@src/components';
import { ModalInstance } from '@src/models';
import { DownloadService, NotificationService, PollingService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { portConnect } from '@src/utils';

storeProxy
  .ready()
  .then(() => {
    // Pass store to services and init
    DownloadService.init(storeProxy, true);
    QueryService.init(storeProxy, true);
    NotificationService.init(storeProxy, true);
    PollingService.init(storeProxy, true);
    // Register as open
    portConnect({ name: ModalInstance.popup });
  })
  .then(() => render(<App store={storeProxy} />, window.document.querySelector('#synology-download-popup-app-container')));

if (module.hot) module.hot.accept();
