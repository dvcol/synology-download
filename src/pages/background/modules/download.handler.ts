import { withLatestFrom } from 'rxjs';

import type { StoreOrProxy } from '@src/models';
import { DownloadStatus } from '@src/models';
import { NotificationService } from '@src/services';
import { store$ } from '@src/store';
import { getSettingsDownloadsNotifications } from '@src/store/selectors';
import { onStatus$ } from '@src/utils';

export const onDownloadEvents = (store: StoreOrProxy) => {
  const settings$ = store$<boolean>(store, getSettingsDownloadsNotifications);
  onStatus$(DownloadStatus.error)
    .pipe(withLatestFrom(settings$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadError(item);
      console.info('On download Error', item, notification);
    });
  onStatus$(DownloadStatus.complete)
    .pipe(withLatestFrom(settings$))
    .subscribe(([item, notification]) => {
      if (notification) NotificationService.downloadFinished(item);
      console.info('On download Complete', item, notification);
    });
};
