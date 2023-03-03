import { finalize, takeWhile } from 'rxjs';

import type { ChromeMessage } from '@dvcol/web-extension-utils';

import manifest from '@src/manifest.json';
import type { SnackNotification, StoreOrProxy } from '@src/models';
import { AppLinks, ChromeMessageType, NotificationLevel } from '@src/models';
import { store$ } from '@src/store';
import { getPopup } from '@src/store/selectors';
import { sendMessage } from '@src/utils';

export const onInstalledEvents = (store: StoreOrProxy) => {
  chrome.runtime.onInstalled.addListener(details => {
    // Ignore force update
    if (details.previousVersion === manifest.version) return;

    const notification: SnackNotification = {
      message: {
        title: `Extension updated to version ${manifest.version}`,
        message: `The extension has been updated with potentially new features, improvements and/or bug fixes.
        
             Please click the button below to learn more about the latest release.`,
        priority: NotificationLevel.info,
        buttons: [
          {
            title: 'see release notes',
            url: AppLinks.Release + (manifest.version ? `/tag/v${manifest.version}` : '/latest'),
          },
        ],
      },
      options: { persist: true },
    };

    const message: ChromeMessage<ChromeMessageType, SnackNotification> = { type: ChromeMessageType.notificationSnack, payload: notification };

    store$(store, getPopup)
      .pipe(
        takeWhile(open => !open),
        finalize(() =>
          sendMessage<SnackNotification>(message).subscribe({
            error: e => console.warn('Snack notification failed to send.', e),
          }),
        ),
      )
      .subscribe();
  });
};
