import { defaultSettings, SettingsSlice } from '../../../models';
import { setNavbar, settingsSlice, store, syncSettings } from '../../../store';
import { buildContextMenu, QueryService } from '../../../services';

// Restore settings
export const restoreSettings = () =>
  chrome.storage.sync.get(settingsSlice.name, ({ settings }) => {
    console.log('restoring from chrome');
    const parsed: SettingsSlice = JSON.parse(settings || '{}');
    // restore settings
    store.dispatch(syncSettings(parsed));
    // reset tab
    if (parsed?.tabs?.length) {
      store.dispatch(setNavbar(parsed?.tabs[0]));
    }
    // Build context menu if exist
    buildContextMenu(parsed?.menus || defaultSettings.menus);

    // test restored login
    QueryService.isReady && QueryService.login().subscribe();
  });
