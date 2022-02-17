import React from 'react';
import { render } from 'react-dom';
import { App } from '@src/components';
import { storeProxy } from '@src/store';
import { NotificationService, PollingService, QueryService } from '@src/services';
import { ModalInstance } from '@src/models';

storeProxy
  .ready()
  .then(() => {
    // Pass store to services and init
    QueryService.init(storeProxy, true);
    NotificationService.init(storeProxy, true);
    PollingService.init(storeProxy, true);
    // Register as open
    chrome.runtime.connect({ name: ModalInstance.popup });
  })
  .then(() => render(<App store={storeProxy} />, window.document.querySelector('#app-container')));

if (module.hot) module.hot.accept();
