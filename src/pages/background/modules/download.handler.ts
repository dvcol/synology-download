import { catchError, firstValueFrom, of, withLatestFrom } from 'rxjs';

import type { DownloadsIntercept } from '@src/models';
import { DownloadStatus } from '@src/models';
import { InterceptService, LoggerService, NotificationService } from '@src/services';
import { addFolderHistory } from '@src/store/actions';
import {
  getDefaultFolder,
  getSettingsDownloadsIntercept,
  getSettingsDownloadsInterceptEnabled,
  getSettingsDownloadsNotifications,
} from '@src/store/selectors';
import { getActiveTab, onFilename$, onStatus$, store$ } from '@src/utils';

import type { Store } from 'redux';
import type { Subscription } from 'rxjs';

const onDownloadEventsNotifications = (store: Store) => {
  LoggerService.debug('Subscribing to download notifications events.');

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

  onStatus$(DownloadStatus.downloading).subscribe(item => {
    // if no folder path
    if (!item?.folder?.length) return;

    const defaultFolder = getDefaultFolder(store.getState());

    // if no default folder
    if (!defaultFolder?.length) return;
    // if same as default folder
    if (defaultFolder === item.folder) return;
    // if not child of default folder
    if (!item.folder.startsWith(defaultFolder)) return;

    // strip default folder
    const relative = item.folder.replace(new RegExp(`^${defaultFolder}`), '');

    // add to history
    if (relative?.length) store.dispatch(addFolderHistory(relative));
  });
};

const onDownloadEventsIntercept = (store: Store) => {
  const enabled$ = store$<boolean>(store, getSettingsDownloadsInterceptEnabled);

  const subscribe = () =>
    onFilename$
      .pipe(
        withLatestFrom(
          store$<DownloadsIntercept>(store, getSettingsDownloadsIntercept),
          store$<boolean>(store, getSettingsDownloadsInterceptEnabled),
        ),
      )
      .subscribe(async ([[download, suggest], intercept, enabled]) => {
        const { all, erase, resume, modal, active } = intercept;

        // If download send by extension ignore it
        if (download?.byExtensionId) return suggest();

        // If intercept disabled
        if (!enabled) return suggest();

        // If extension not supported
        if (!all && !active.some(({ ext, mime }) => download.filename?.endsWith(ext) && (!mime?.length || download.mime === mime))) {
          return suggest();
        }
        // To ignore error since we catch them in Intercept
        const handler = { error: () => null };
        if (!modal) return InterceptService.transfer(download, { erase, resume }, suggest).subscribe(handler);

        // If no active tab or pending navigation (link drag/drop)
        const tab = await firstValueFrom(getActiveTab().pipe(catchError(() => of(null))));
        if (!tab?.id || tab?.pendingUrl) return suggest();

        // Else open menu
        InterceptService.openMenu(download, { erase, resume }, suggest).subscribe(handler);
      });

  let sub: Subscription;
  enabled$.subscribe(_enabled => {
    if (_enabled) {
      LoggerService.debug('Subscribing to download intercepts events.');
      sub = subscribe();
    } else {
      LoggerService.debug('Unsubscribing from download intercepts events.');
      sub?.unsubscribe();
    }
  });
};

export const onDownloadEvents = (store: Store) => {
  LoggerService.debug('Subscribing to download events.');

  onDownloadEventsNotifications(store);
  onDownloadEventsIntercept(store);
};
