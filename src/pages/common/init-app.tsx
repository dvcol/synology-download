import React from 'react';
import { render } from 'react-dom';

import { App } from '@src/components';
import type { AppRoute, ModalInstance, QueryAutoLoginOptions, RootSlice, ServiceInstance } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { onMessage, portConnect, store$ } from '@src/utils';

export const initApp = async (
  logInstance: ServiceInstance,
  modalInstance: ModalInstance,
  getter: (state: RootSlice) => boolean,
  redirect?: AppRoute,
): Promise<void> => {
  await storeProxy.ready();

  // Pass store to service and init
  LoggerService.init(storeProxy, logInstance, true);
  DownloadService.init(storeProxy, true);
  QueryService.init(storeProxy, logInstance, true);
  NotificationService.init(storeProxy, logInstance, true);
  PollingService.init(storeProxy, true);

  // Register as open
  portConnect({ name: modalInstance });

  // attempt auto-login on open
  store$<boolean>(storeProxy, getter).subscribe(open => {
    if (open && QueryService.isReady) QueryService.autoLogin().subscribe();
  });

  // Listens to auto login attempts -- TODO - fix HTTPS and remove this
  onMessage<QueryAutoLoginOptions>([ChromeMessageType.autoLogin]).subscribe(({ message: { payload } }) =>
    QueryService.autoLogin(payload).subscribe(),
  );

  // Render the app
  render(<App store={storeProxy} redirect={redirect} />, window.document.querySelector(`#${modalInstance}-app-container`));
};