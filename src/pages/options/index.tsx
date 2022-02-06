import React from 'react';
import { render } from 'react-dom';
import { proxyStore } from '@src/store';
import { NotificationService, QueryService } from '@src/services';
import { ModalInstance } from '@src/models';
import { App } from '@src/components';

// TODO custom UI for options
proxyStore
  .ready()
  .then(() => {
    // Pass store to services and init
    QueryService.init(proxyStore, true);
    NotificationService.init(proxyStore, true);
    // Register as open
    chrome.runtime.connect({ name: ModalInstance.option });
  })
  .then(() => render(<App store={proxyStore} />, window.document.querySelector('#app-container')));

if (module.hot) module.hot.accept();
