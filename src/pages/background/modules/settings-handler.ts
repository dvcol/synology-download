import type { SettingsSlice, StoreOrProxy } from '../../../models/store.model';

import { catchError, finalize, from, of, switchMap } from 'rxjs';

import { defaultSettings, SyncSettingMode } from '../../../models/settings.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { setNavbar } from '../../../store/actions/navbar.action';
import { setSettings } from '../../../store/actions/settings.action';
import { settingsSlice } from '../../../store/slices/settings.slice';
import { buildContextMenu } from '../../../utils/chrome/chrome-context.utils';
import { setBadgeBackgroundColor } from '../../../utils/chrome/chrome.utils';
import { localGet, syncGet } from '../../../utils/webex.utils';

async function dispatchRestoreSettings(store: StoreOrProxy, settings: SettingsSlice) {
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
  await buildContextMenu({ menus: settings?.menus || defaultSettings.menus, scrape: settings?.scrape?.menu });
  return settings;
}

/** Restore extension settings */
export function restoreSettings(store: StoreOrProxy) {
  return localGet<SettingsSlice>(settingsSlice.name).pipe(
    switchMap((settings) => {
      if (settings?.sync?.mode === SyncSettingMode.local) return of(settings);
      return syncGet<SettingsSlice>(settingsSlice.name);
    }),
    switchMap(settings => from(dispatchRestoreSettings(store, settings))),
    finalize(() => LoggerService.debug('Settings restored.')),
    catchError((err) => {
      LoggerService.error('Setting slice failed to restore.', err);
      return of(null);
    }),
  );
}
