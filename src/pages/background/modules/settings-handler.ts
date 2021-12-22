import { defaultSettings, SettingsSlice, StateSlice } from '../../../models';
import { setNavbar, settingsSlice, stateSlice, store, syncSettings } from '../../../store';
import { buildContextMenu, QueryService } from '../../../services';
import { parseJSON } from '../../../utils';

// Restore settings
export const restoreSettings = () =>
  chrome.storage.sync.get(settingsSlice.name, ({ settings }) => {
    console.log('restoring from chrome');
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

    chrome.storage.sync.get(stateSlice.name, ({ state }) => {
      const restoredState: StateSlice = JSON.parse(state || '{}');
      // test restored login
      restoredState?.logged && restoredSettings?.connection?.rememberMe && QueryService.isReady && QueryService.login().subscribe();
    });
  });
