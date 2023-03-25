import { catchError, finalize, from, lastValueFrom, of, switchMap } from 'rxjs';

import type { SettingsSlice } from '@src/models';
import { defaultSettings, SyncSettingMode } from '@src/models';
import { LoggerService } from '@src/services';
import { setNavbar, setSettings } from '@src/store/actions';
import { settingsSlice } from '@src/store/slices/settings.slice';
import { localGet, syncGet, buildContextMenu, setBadgeBackgroundColor } from '@src/utils';

import type { Store } from 'redux';

const dispatchRestoreSettings = async (store: Store, settings: SettingsSlice) => {
  LoggerService.debug(`Restoring settings from chrome '${settings?.sync?.mode ?? SyncSettingMode.sync}' storage...`, settings);
  // restore settings
  await store.dispatch(setSettings(settings));

  // restore badge color
  const color = settings?.notifications?.count?.color;
  if (color) {
    await setBadgeBackgroundColor({ color });
    LoggerService.debug('Badge color restored to ', color);
  }

  // restore tabs
  if (settings?.tabs?.length) await store.dispatch(setNavbar(settings?.tabs[0]));

  // restore context menu
  await lastValueFrom(buildContextMenu(settings?.menus || defaultSettings.menus));
  return settings;
};

/** Restore extension settings */
export const restoreSettings = (store: Store) =>
  localGet<SettingsSlice>(settingsSlice.name).pipe(
    switchMap(settings => {
      if (settings?.sync?.mode === SyncSettingMode.local) return of(settings);
      return syncGet<SettingsSlice>(settingsSlice.name);
    }),
    switchMap(settings => from(dispatchRestoreSettings(store, settings))),
    finalize(() => LoggerService.debug('Settings restored.')),
    catchError(err => {
      LoggerService.error('Setting slice failed to restore.', err);
      return of(null);
    }),
  );
