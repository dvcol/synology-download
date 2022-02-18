import { SettingsSlice, StateSlice } from '@src/models';
import { stateSlice } from '@src/store/slices';
import { QueryService } from '@src/services';
import { syncGet } from '@src/utils';

/**
 * Restore Login state from settings
 * @param settings restored setting slice
 */
export const restoreSate = (settings: SettingsSlice) =>
  syncGet<StateSlice>(stateSlice.name).subscribe((state) => {
    console.debug('restoring state from chrome storage', state);
    // test restored login
    state?.logged && settings?.connection?.rememberMe && QueryService.isReady && QueryService.login().subscribe();
  });
