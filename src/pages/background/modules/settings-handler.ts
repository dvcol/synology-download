import { defaultSettings, SettingsSlice } from '../../../models';
import { setNavbar, settingsSlice, store, syncSettings } from '../../../store';
import { buildContextMenu } from '../../../services';
import { parseJSON } from '../../../utils';
import { restoreSate } from './state-handler';

/** Restore extension settings */
export const restoreSettings = () =>
  chrome.storage.sync.get(settingsSlice.name, ({ settings }) => {
    console.debug('restoring settings from chrome storage');
    const restoredSettings = parseJSON<SettingsSlice>(settings);
    // restore settings
    store.dispatch(syncSettings(restoredSettings));

    // restore badge color
    const color = restoredSettings?.notifications?.count?.color;
    if (color) {
      chrome.action.setBadgeBackgroundColor({ color }).then(() => console.debug('Badge color restored to ', color));
    }

    // restore tabs
    if (restoredSettings?.tabs?.length) {
      store.dispatch(setNavbar(restoredSettings?.tabs[0]));
    }
    // restore context menu
    buildContextMenu(restoredSettings?.menus || defaultSettings.menus).subscribe();

    // restore login state
    restoreSate(restoredSettings);
  });
