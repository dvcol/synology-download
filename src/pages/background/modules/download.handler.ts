import { withLatestFrom } from 'rxjs';

import type { DownloadsIntercept, StoreOrProxy } from '@src/models';
import { DownloadStatus } from '@src/models';
import { NotificationService } from '@src/services';
import { InterceptService } from '@src/services/download/intercept.service';
import { store$ } from '@src/store';
import { getSettingsDownloadsIntercept, getSettingsDownloadsNotifications } from '@src/store/selectors';
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

  const intercept$ = store$<DownloadsIntercept>(store, getSettingsDownloadsIntercept);
  onFilename$.pipe(withLatestFrom(intercept$)).subscribe(([[download, suggest], intercept]) => {
    const { enabled, all, erase, resume, modal, active } = intercept;

    if (!enabled) return suggest();
    if (!all && !active.some(({ ext, mime }) => download.filename?.endsWith(ext) && (!mime?.length || download.mime === mime))) return suggest();

    const release = { complete: () => suggest(), error: () => suggest() };

    if (!modal) return InterceptService.transfer(download, { erase, resume }).subscribe(release);
    InterceptService.openMenu(download, { erase, resume }).subscribe(release);
  });
};
