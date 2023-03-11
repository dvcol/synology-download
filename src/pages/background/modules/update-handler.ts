import { combineLatest, map, of, takeWhile } from 'rxjs';

import type { ChromeMessage, Manifest } from '@dvcol/web-extension-utils';
import { getManifest, injectContentScripts } from '@dvcol/web-extension-utils';

import type { SnackNotification, StoreOrProxy } from '@src/models';
import { AppLinks, ChromeMessageType, NotificationLevel } from '@src/models';
import { LoggerService } from '@src/services';
import { getPopup } from '@src/store/selectors';
import { onInstalled$, sendMessage, store$ } from '@src/utils';

type InstalledPayload = { open: boolean; previousVersion?: string; nextVersion: string };
export const onInstalledEvents = (store: StoreOrProxy) => {
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
                url: AppLinks.Release + (nextVersion ? `/tag/v${nextVersion}` : '/latest'),
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
};
