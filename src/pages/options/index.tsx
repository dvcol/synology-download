import React from 'react';
import { render } from 'react-dom';
import { storeProxy } from '@src/store';
import { NotificationService, PollingService, QueryService } from '@src/services';
import { ModalInstance } from '@src/models';
import { App } from '@src/components';
import { portConnect } from '@src/utils';

// TODO custom UI for options
storeProxy
  .ready()
  .then(() => {
    // Pass store to services and init
    QueryService.init(storeProxy, true);
    NotificationService.init(storeProxy, true);
    PollingService.init(storeProxy, true);
    // Register as open
    portConnect({ name: ModalInstance.option });
  })
  .then(() => render(<App store={storeProxy} />, window.document.querySelector('#app-container')));

if (module.hot) module.hot.accept();
