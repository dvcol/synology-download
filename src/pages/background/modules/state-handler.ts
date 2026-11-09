import type { StateSlice, StoreOrProxy } from '../../../models/store.model';

import { catchError, finalize, from, map, of, switchMap, tap } from 'rxjs';

import { LoggerService } from '../../../services/logger/logger.service';
import { QueryService } from '../../../services/query/query.service';
import { restoreState, setLogged, setSid } from '../../../store/actions/state.action';
import { SidSessionKey } from '../../../store/reducers/state.reducer';
import { stateSlice } from '../../../store/slices/state.slice';
import { localGet } from '../../../utils/webex.utils';

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
 * Read the sid kept in session storage by a previous service worker instance (if any)
 */
function getSessionSid() {
  const session = globalThis.chrome?.storage?.session;
  if (!session) return of(undefined);
  return from(session.get(SidSessionKey)).pipe(
    map(result => result?.[SidSessionKey] as string | undefined),
    catchError((err) => {
      LoggerService.warn('Failed to read sid from session storage.', err);
      return of(undefined);
    }),
  );
}

/**
 * Resume the previous DSM session if its sid is still valid, else fall back to auto-login
 * @param store redux store instance
 * @param sid the sid saved in session storage
 */
export function restoreSession(store: StoreOrProxy, sid?: string) {
  if (!sid || !QueryService.isReady) return restoreLoginSate();

  void store.dispatch(setSid(sid));
  QueryService.setSid(sid);
  void store.dispatch(setLogged(true));

  // Cheap authenticated call to check the session has not expired on the NAS
  return QueryService.getInfo().pipe(
    tap(() => LoggerService.debug('Session restored from session storage.')),
    map(() => null),
    catchError((err) => {
      LoggerService.debug('Saved session is no longer valid, attempting auto-login.', err);
      void store.dispatch(setSid(undefined));
      QueryService.setSid(undefined);
      void store.dispatch(setLogged(false));
      return restoreLoginSate();
    }),
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

      // restore the previous session if possible, else login state based on settings
      return getSessionSid().pipe(switchMap(sid => restoreSession(store, sid)));
    }),
    finalize(() => LoggerService.debug('Local state slice restored.')),
    catchError((err) => {
      LoggerService.error('Local state slice failed to restore.', err);
      return of(null);
    }),
  );
}
