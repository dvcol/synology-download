import type { AppInstance } from '../../models/app-instance.model';
import type { QueryAutoLoginOptions } from '../../models/query.model';
import type { AppRoutes } from '../../models/routes.model';
import type { ServiceInstance } from '../../models/settings.model';
import type { RootSlice } from '../../models/store.model';

import { createRoot } from 'react-dom/client';

import { App } from '../../components/App';
import { setInstance } from '../../models/app-instance.model';
import { ChromeMessageType } from '../../models/message.model';
import { DownloadService } from '../../services/download/download.service';
import { LoggerService } from '../../services/logger/logger.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PollingService } from '../../services/polling/polling.service';
import { QueryService } from '../../services/query/query.service';
import { storeProxy } from '../../store/store-proxy';
import { onMessage, portConnect } from '../../utils/chrome/chrome-message.utils';
import { store$ } from '../../utils/rxjs.utils';

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
  createRoot(window.document.querySelector(`#${appInstance}-app-container`)!).render(<App store={storeProxy} redirect={redirect} instance={appInstance} />);
}
