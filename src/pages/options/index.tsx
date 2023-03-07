import React from 'react';

import { render } from 'react-dom';

import { App } from '@src/components';
import { AppRoute, ModalInstance } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { getOption } from '@src/store/selectors';
import { portConnect, store$ } from '@src/utils';

// TODO custom UI for options
const initOptionsApp = async () => {
  await storeProxy.ready();

  // Pass store to service and init
  LoggerService.init(storeProxy);
  DownloadService.init(storeProxy, true);
  QueryService.init(storeProxy, true);
  NotificationService.init(storeProxy, true);
  PollingService.init(storeProxy, true);

  // Register as open
  portConnect({ name: ModalInstance.option });

  // attempt auto-login on open
  store$<boolean>(storeProxy, getOption).subscribe(open => {
    if (open && QueryService.isReady) QueryService.autoLogin().subscribe();
  });

  // Render the app
  render(<App store={storeProxy} redirect={AppRoute.Settings} />, window.document.querySelector('#synology-download-options-app-container'));
};

initOptionsApp()
  .then(() => LoggerService.debug('Options app initialised.'))
  .catch(err => LoggerService.debug('Options app failed to initialised.', err));

if (module.hot) module.hot.accept();
