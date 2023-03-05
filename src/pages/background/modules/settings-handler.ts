import { syncGet } from '@dvcol/web-extension-utils';

import type { SettingsSlice } from '@src/models';
import { defaultSettings } from '@src/models';
import { setNavbar, syncSettings } from '@src/store/actions';
import { settingsSlice } from '@src/store/slices/settings.slice';
import { buildContextMenu, setBadgeBackgroundColor } from '@src/utils';

import { restoreLoginSate } from './state-handler';

import type { Store } from 'redux';

/** Restore extension settings */
export const restoreSettings = (store: Store) =>
  syncGet<SettingsSlice>(settingsSlice.name).subscribe(settings => {
    console.debug('restoring settings from chrome storage', settings);
    // restore settings
    store.dispatch(syncSettings(settings));

    // restore badge color
    const color = settings?.notifications?.count?.color;
    if (color) setBadgeBackgroundColor({ color }).then(() => console.debug('Badge color restored to ', color));

    // restore tabs
    if (settings?.tabs?.length) store.dispatch(setNavbar(settings?.tabs[0]));

    // restore context menu
    buildContextMenu(settings?.menus || defaultSettings.menus).subscribe();

    // restore login state
    restoreLoginSate(settings);
  });
