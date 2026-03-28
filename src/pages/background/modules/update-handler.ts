import type { SnackNotification } from '../../../models/notification.model';
import type { StoreOrProxy } from '../../../models/store.model';
import type { ChromeMessage, Manifest } from '../../../utils/webex.utils';

import { combineLatest, map, of, takeWhile } from 'rxjs';

import { AppLinks } from '../../../models/links.model';
import { ChromeMessageType } from '../../../models/message.model';
import { NotificationLevel } from '../../../models/notification.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { getPopup } from '../../../store/selectors/state.selector';
import { onInstalled$, sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { store$ } from '../../../utils/rxjs.utils';
import { getManifest, injectContentScripts } from '../../../utils/webex.utils';

interface InstalledPayload { open: boolean; previousVersion?: string; nextVersion: string }
export function onInstalledEvents(store: StoreOrProxy) {
  LoggerService.debug('Subscribing to install events.');

  // re-inject content scripts in open tabs
  injectContentScripts();

  // Subscribe to installed until first popup open
  combineLatest([store$<boolean>(store, getPopup), onInstalled$, of<Manifest>(getManifest())])
    .pipe(
      // take while popup is closed and new version available
      map(([open, { previousVersion }, { version }]) => {
        const payload: InstalledPayload = { open, previousVersion, nextVersion: version };
        LoggerService.info('Service worker installed', payload);
        return payload;
      }),
      takeWhile(({ open, previousVersion, nextVersion }) => previousVersion !== nextVersion && !open, true),
      map<InstalledPayload, ChromeMessage<ChromeMessageType, SnackNotification>>(({ nextVersion }) => ({
        type: ChromeMessageType.notificationSnack,
        payload: {
          message: {
            title: `Updated to version ${nextVersion}`,
            message: `
            A new update (version ${nextVersion}) has just been installed.
    
            To now more about the changes, please click on the button below.`,
            priority: NotificationLevel.info,
            buttons: [
              {
                title: 'see release notes',
                url: AppLinks.Release,
              },
            ],
          },
          options: { persist: true },
        },
      })),
    )
    .subscribe(message =>
      sendMessage<SnackNotification>(message).subscribe({
        error: e => LoggerService.warn('Snack notification failed to send.', e),
      }),
    );
}
