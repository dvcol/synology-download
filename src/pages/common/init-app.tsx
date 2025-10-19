import type { AppInstance, AppRoutes, QueryAutoLoginOptions, RootSlice, ServiceInstance } from '@src/models';

import React from 'react';
import { render } from 'react-dom';

import { App } from '@src/components';
import { ChromeMessageType, setInstance } from '@src/models';
import { DownloadService, LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { storeProxy } from '@src/store';
import { onMessage, portConnect, store$ } from '@src/utils';

export async function initApp(logInstance: ServiceInstance, appInstance: AppInstance, getter: (state: RootSlice) => boolean, redirect?: AppRoutes): Promise<void> {
  // Set global instance
  setInstance(appInstance);

  // init store
  await storeProxy.ready();

  // Pass store to service and init
  LoggerService.init({ store: storeProxy, source: logInstance, isProxy: true });
  DownloadService.init(storeProxy, true);
  QueryService.init(storeProxy, logInstance, true);
  NotificationService.init(storeProxy, logInstance, true);
  PollingService.init(storeProxy, true);

  // Register as open
  portConnect({ name: appInstance });

  // attempt auto-login on open
  store$<boolean>(storeProxy, getter).subscribe((open) => {
    if (open && QueryService.isReady) QueryService.autoLogin().subscribe();
  });

  // Listens to auto login attempts -- TODO - fix HTTPS and remove this
  onMessage<QueryAutoLoginOptions>([ChromeMessageType.autoLogin]).subscribe(({ message: { payload } }) =>
    QueryService.autoLogin(payload).subscribe(),
  );

  // Render the app
  render(<App store={storeProxy} redirect={redirect} instance={appInstance} />, window.document.querySelector(`#${appInstance}-app-container`));
}
