import { withLatestFrom } from 'rxjs';

import type { DownloadsIntercept, StoreOrProxy } from '@src/models';
import { DownloadStatus } from '@src/models';
import { InterceptService, NotificationService } from '@src/services';
import { store$ } from '@src/store';
import { getSettingsDownloadsIntercept, getSettingsDownloadsInterceptEnabled, getSettingsDownloadsNotifications } from '@src/store/selectors';
import { onFilename$, onStatus$ } from '@src/utils';

export const onDownloadEvents = (store: StoreOrProxy) => {
  const notifications$ = store$<boolean>(store, getSettingsDownloadsNotifications);
  onStatus$(DownloadStatus.error)
    .pipe(withLatestFrom(notifications$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadError(item);
    });
  onStatus$(DownloadStatus.complete)
    .pipe(withLatestFrom(notifications$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadFinished(item);
    });

  const enabled$ = store$<boolean>(store, getSettingsDownloadsInterceptEnabled);
  const intercept$ = store$<DownloadsIntercept>(store, getSettingsDownloadsIntercept);
  onFilename$.pipe(withLatestFrom(intercept$, enabled$)).subscribe(([[download, suggest], intercept, enabled]) => {
    const { all, erase, resume, modal, active } = intercept;

    if (!enabled) return suggest();
    if (!all && !active.some(({ ext, mime }) => download.filename?.endsWith(ext) && (!mime?.length || download.mime === mime))) return suggest();

    const handler = {
      error: () => {
        /* empty because error are logged in InterceptService */
      },
    };
    if (!modal) return InterceptService.transfer(download, { erase, resume }, suggest).subscribe(handler);
    InterceptService.openMenu(download, { erase, resume }, suggest).subscribe(handler);
  });
};
