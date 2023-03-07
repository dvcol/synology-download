import { catchError, NEVER, switchMap, tap } from 'rxjs';

import { syncGet } from '@dvcol/web-extension-utils';

import type { SettingsSlice } from '@src/models';
import { defaultSettings } from '@src/models';
import { setNavbar, syncSettings } from '@src/store/actions';
import { settingsSlice } from '@src/store/slices/settings.slice';
import { buildContextMenu, setBadgeBackgroundColor } from '@src/utils';

import type { Store } from 'redux';

/** Restore extension settings */
export const restoreSettings = (store: Store) =>
  syncGet<SettingsSlice>(settingsSlice.name).pipe(
    switchMap(async settings => {
      console.debug('restoring settings from chrome storage', settings);
      // restore settings
      store.dispatch(syncSettings(settings));

      // restore badge color
      const color = settings?.notifications?.count?.color;
      if (color) {
        await setBadgeBackgroundColor({ color });
        console.debug('Badge color restored to ', color);
      }

      // restore tabs
      if (settings?.tabs?.length) store.dispatch(setNavbar(settings?.tabs[0]));

      // restore context menu
      return buildContextMenu(settings?.menus || defaultSettings.menus);
    }),
    tap(() => console.debug('Settings restored.')),
    catchError(err => {
      console.error('setting slice failed to restore.', err);
      return NEVER;
    }),
  );
