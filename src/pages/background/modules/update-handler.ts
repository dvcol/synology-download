import { combineLatest, filter, map, takeWhile } from 'rxjs';

import type { ChromeMessage } from '@dvcol/web-extension-utils';

import manifest from '@src/manifest.json';
import type { SnackNotification, StoreOrProxy } from '@src/models';
import { AppLinks, ChromeMessageType, NotificationLevel } from '@src/models';
import { store$ } from '@src/store';
import { getPopup } from '@src/store/selectors';
import type { InstalledDetails } from '@src/utils';
import { onInstalled$, sendMessage } from '@src/utils';

export const onInstalledEvents = (store: StoreOrProxy) => {
  // Subscribe to installed until first popup open
  combineLatest([store$<boolean>(store, getPopup), onInstalled$])
    .pipe(
      // take while popup is closed and new version available
      takeWhile(([open, { previousVersion }]) => previousVersion !== manifest.version && !open, true),
      // only emits if popup is open and new version available
      filter(([open, { previousVersion }]) => previousVersion !== manifest.version && open),
      map<[boolean, InstalledDetails], ChromeMessage<ChromeMessageType, SnackNotification>>(([_, { previousVersion }]) => ({
        type: ChromeMessageType.notificationSnack,
        payload: {
          message: {
            title: `Updated to version ${manifest.version}`,
            message: `A new update has just been installed (from '${previousVersion}' to '${manifest.version}').
    
         To now more about the release, please click on the button below.`,
            priority: NotificationLevel.info,
            buttons: [
              {
                title: 'see release notes',
                url: AppLinks.Release + (manifest.version ? `/tag/v${manifest.version}` : '/latest'),
              },
            ],
          },
          options: { persist: true },
        },
      })),
    )
    .subscribe(message =>
      sendMessage<SnackNotification>(message).subscribe({
        error: e => console.warn('Snack notification failed to send.', e),
      }),
    );
};
