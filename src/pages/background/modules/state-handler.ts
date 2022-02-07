import { SettingsSlice, StateSlice } from '@src/models';
import { stateSlice } from '@src/store/slices';
import { QueryService } from '@src/services';

/**
 * Restore Login state from settings
 * @param settings restored setting slice
 */
export const restoreSate = (settings: SettingsSlice) =>
  chrome.storage.sync.get(stateSlice.name, ({ state }) => {
    const restoredState: StateSlice = JSON.parse(state || '{}');
    // test restored login
    restoredState?.logged && settings?.connection?.rememberMe && QueryService.isReady && QueryService.login().subscribe();
  });
