import { ConnectionType, SettingsSlice, StateSlice } from '@src/models';
import { QueryService } from '@src/services';
import { stateSlice } from '@src/store/slices';
import { localGet } from '@src/utils';

/**
 * Restore Login state from settings
 * @param settings restored setting slice
 */
export const restoreSate = (settings: SettingsSlice) =>
  localGet<StateSlice>(stateSlice.name).subscribe((state) => {
    console.debug('restoring state from chrome storage', state);
    // If service initialized & remember me && logged
    if (!QueryService.isReady || !settings?.connection?.autoLogin || !settings?.connection?.rememberMe) return;
    // If device token for 2FA && device id saved
    if (settings?.connection?.type === ConnectionType.twoFactor && (!settings?.connection.enable_device_token || !settings?.connection.device_id))
      return;
    // Restore login
    QueryService.login().subscribe();
  });
