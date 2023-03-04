import { withLatestFrom } from 'rxjs';

import type { DownloadsIntercept, StoreOrProxy } from '@src/models';
import { DownloadStatus } from '@src/models';
import { InterceptService, NotificationService } from '@src/services';
import { store$ } from '@src/store';
import { getSettingsDownloadsIntercept, getSettingsDownloadsInterceptEnabled, getSettingsDownloadsNotifications } from '@src/store/selectors';
import { onFilename$, onStatus$ } from '@src/utils';

import type { Subscription } from 'rxjs';

const onDownloadEventsNotifications = (store: StoreOrProxy) => {
  const notifications$ = store$<boolean>(store, getSettingsDownloadsNotifications);
  onStatus$(DownloadStatus.complete)
    .pipe(withLatestFrom(notifications$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadFinished(item);
    });

  onStatus$(DownloadStatus.error)
    .pipe(withLatestFrom(notifications$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadError(item);
    });
};

const onDownloadEventsIntercept = (store: StoreOrProxy) => {
  const enabled$ = store$<boolean>(store, getSettingsDownloadsInterceptEnabled);

  const subscribe = () =>
    onFilename$
      .pipe(
        withLatestFrom(
          store$<DownloadsIntercept>(store, getSettingsDownloadsIntercept),
          store$<boolean>(store, getSettingsDownloadsInterceptEnabled),
        ),
      )
      .subscribe(([[download, suggest], intercept, enabled]) => {
        const { all, erase, resume, modal, active } = intercept;

        if (!enabled) return suggest();
        if (!all && !active.some(({ ext, mime }) => download.filename?.endsWith(ext) && (!mime?.length || download.mime === mime))) {
          return suggest();
        }
        // To ignore error since we catch them in Intercept
        const handler = { error: () => null };
        if (!modal) return InterceptService.transfer(download, { erase, resume }, suggest).subscribe(handler);
        InterceptService.openMenu(download, { erase, resume }, suggest).subscribe(handler);
      });

  let sub: Subscription;
  enabled$.subscribe(_enabled => {
    if (_enabled) {
      console.info('======> subscribe');
      sub = subscribe();
    } else {
      console.info('======> unsubscribe');
      sub?.unsubscribe();
    }
  });
};

export const onDownloadEvents = (store: StoreOrProxy) => {
  onDownloadEventsNotifications(store);
  onDownloadEventsIntercept(store);
};
