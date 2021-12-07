import { defaultSettings, SettingsSlice, StateSlice } from '../../../models';
import { setNavbar, settingsSlice, stateSlice, store, syncSettings } from '../../../store';
import { buildContextMenu, QueryService } from '../../../services';

// Restore settings
export const restoreSettings = () =>
  chrome.storage.sync.get(settingsSlice.name, ({ settings }) => {
    console.log('restoring from chrome');
    const restoredSettings: SettingsSlice = JSON.parse(settings || '{}');
    // restore settings
    store.dispatch(syncSettings(restoredSettings));
    // reset tab
    if (restoredSettings?.tabs?.length) {
      store.dispatch(setNavbar(restoredSettings?.tabs[0]));
    }
    // Build context menu if exist
    buildContextMenu(restoredSettings?.menus || defaultSettings.menus);

    chrome.storage.sync.get(stateSlice.name, ({ state }) => {
      const restoredState: StateSlice = JSON.parse(state || '{}');
      // test restored login
      restoredState?.logged && restoredSettings?.connection?.rememberMe && QueryService.isReady && QueryService.login().subscribe();
    });
  });
