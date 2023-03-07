import { catchError, of, switchMap, tap } from 'rxjs';

import { localGet } from '@dvcol/web-extension-utils';

import type { SettingsSlice, StateSlice } from '@src/models';
import { LoggerService, QueryService } from '@src/services';
import { restoreState } from '@src/store/actions';
import { stateSlice } from '@src/store/slices/state.slice';

import type { Store } from 'redux';

/**
 * Restore Login state from settings
 * @param state the restored state slice
 * @param settings the restored settings slice
 */
export const restoreLoginSate = (state?: StateSlice, settings?: SettingsSlice) => {
  // If service is not initialized with url
  if (!QueryService.isReady) return of(null);

  // Attempt to Restore login
  return QueryService.autoLogin({ state, settings, notify: false }).pipe(
    tap(() => LoggerService.debug('Login state restored.')),
    catchError(() => of(null)),
  );
};

/**
 * Restore state from local storage
 * @param store redux store instance
 */
export const restoreLocalSate = (store: Store) =>
  localGet<StateSlice>(stateSlice.name).pipe(
    switchMap(state => {
      LoggerService.debug('restoring state from chrome storage', state);

      // restore saved state while removing logged state
      store.dispatch(restoreState({ ...state, logged: false }));

      // restore login state based on settings
      return restoreLoginSate();
    }),
    tap(() => LoggerService.debug('Local state restored.')),
    catchError(err => {
      LoggerService.error('local state failed to restore.', err);
      return of(null);
    }),
  );
