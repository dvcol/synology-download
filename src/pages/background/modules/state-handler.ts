import type { StateSlice, StoreOrProxy } from '@src/models';

import { catchError, finalize, of, switchMap, tap } from 'rxjs';

import { LoggerService, QueryService } from '@src/services';
import { restoreState } from '@src/store/actions';
import { stateSlice } from '@src/store/slices/state.slice';
import { localGet } from '@src/utils';

/**
 * Restore Login state from settings
 */
export function restoreLoginSate() {
  // If service is not initialized with url
  if (!QueryService.isReady) return of(null);

  // Attempt to Restore login
  return QueryService.autoLogin({ notify: false }).pipe(
    tap(() => LoggerService.debug('Login state restored.')),
    catchError(() => of(null)),
  );
}

/**
 * Restore state from local storage
 * @param store redux store instance
 */
export function restoreLocalSate(store: StoreOrProxy) {
  return localGet<StateSlice>(stateSlice.name).pipe(
    switchMap((state) => {
      LoggerService.debug('Restoring state slice from chrome storage...', state);

      // restore saved state while removing logged state
      void store.dispatch(restoreState({ ...state, logged: false }));

      // restore login state based on settings
      return restoreLoginSate();
    }),
    finalize(() => LoggerService.debug('Local state slice restored.')),
    catchError((err) => {
      LoggerService.error('Local state slice failed to restore.', err);
      return of(null);
    }),
  );
}
