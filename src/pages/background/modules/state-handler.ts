import { catchError, of, switchMap, tap } from 'rxjs';

import { localGet } from '@dvcol/web-extension-utils';

import type { StateSlice } from '@src/models';
import { LoggerService, QueryService } from '@src/services';
import { restoreState } from '@src/store/actions';
import { stateSlice } from '@src/store/slices/state.slice';

import type { Store } from 'redux';

/**
 * Restore Login state from settings
 */
export const restoreLoginSate = () => {
  // If service is not initialized with url
  if (!QueryService.isReady) return of(null);

  // Attempt to Restore login
  return QueryService.autoLogin({ notify: false }).pipe(
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
