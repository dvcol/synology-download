import { localGet } from '@dvcol/web-extension-utils';

import type { SettingsSlice, StateSlice } from '@src/models';
import { ConnectionType } from '@src/models';
import { QueryService } from '@src/services';
import { restoreState } from '@src/store/actions';
import { stateSlice } from '@src/store/slices/state.slice';

import type { Store } from 'redux';

/**
 * Restore Login state from settings
 * @param settings restored setting slice
 */
export const restoreLoginSate = (settings: SettingsSlice) =>
  localGet<StateSlice>(stateSlice.name).subscribe(state => {
    console.debug('restoring logged state from chrome storage', state);
    // If service is not initialized with url
    if (!QueryService.isReady) return;
    // If remember me is not enabled
    if (!settings?.connection?.rememberMe) return;
    // If no auto-login and no previous logged state
    if (!state?.logged && !settings?.connection?.autoLogin) return;
    // If device token for 2FA && no device id saved
    if (settings?.connection?.type === ConnectionType.twoFactor && (!settings?.connection.enable_device_token || !settings?.connection.device_id))
      return;

    // If missing username
    if (!settings?.connection?.username) return;
    // If missing password
    if (!settings?.connection?.password) return;

    // Attempt to Restore login
    QueryService.login().subscribe();
  });

/**
 * Restore state from local storage
 * @param store redux store instance
 */
export const restoreLocalSate = (store: Store) =>
  localGet<StateSlice>(stateSlice.name).subscribe(state => {
    console.debug('restoring state from chrome storage', state);
    // restore saved state
    store.dispatch(restoreState(state));
  });
