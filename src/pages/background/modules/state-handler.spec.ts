/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-argument */
import type { StoreOrProxy } from '../../../models/store.model';

import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryService } from '../../../services/query/query.service';
import { restoreState } from '../../../store/actions/state.action';
import { localGet } from '../../../utils/webex.utils';
import { restoreLocalSate, restoreLoginSate, restoreSession } from './state-handler';

vi.mock('../../../utils/webex.utils', () => ({
  localGet: vi.fn(),
  syncGet: vi.fn(() => of({})),
  localSet: vi.fn(() => of({})),
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  ProxyLogger: class {
    debug = vi.fn();
  },
  getManifest: vi.fn(() => ({ version: '2.0.3' })),
}));

vi.mock('../../../services/logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../services/query/query.service', () => ({
  QueryService: {
    isReady: false,
    autoLogin: vi.fn(() => of(null)),
    getInfo: vi.fn(() => of({})),
    setSid: vi.fn(),
    init: vi.fn(),
    isLoggedIn: false,
  },
}));

vi.mock('../../../store/actions/state.action', () => ({
  restoreState: vi.fn((v: unknown) => ({ type: 'RESTORE_STATE', payload: v })),
  setLogged: vi.fn((v: unknown) => ({ type: 'SET_LOGGED', payload: v })),
  setSid: vi.fn((v: unknown) => ({ type: 'SET_SID', payload: v })),
}));

vi.mock('../../../store/reducers/state.reducer', () => ({
  SidSessionKey: 'sid',
}));

vi.mock('../../../store/slices/state.slice', () => ({
  stateSlice: { name: 'state' },
}));

describe('state-handler', () => {
  let store: StoreOrProxy;

  beforeEach(() => {
    vi.clearAllMocks();
    store = {
      dispatch: vi.fn(),
      getState: vi.fn(() => ({})),
      subscribe: vi.fn(),
      replaceReducer: vi.fn(),
      [Symbol.observable]: vi.fn(),
    } as unknown as StoreOrProxy;
  });

  describe('restoreLoginSate', () => {
    it('should return null observable when QueryService is not ready', async () => {
      (QueryService as any).isReady = false;

      const result = await firstValueFrom(restoreLoginSate());
      expect(result).toBeNull();
    });

    it('should call autoLogin when QueryService is ready', async () => {
      (QueryService as any).isReady = true;

      await firstValueFrom(restoreLoginSate());

      expect(QueryService.autoLogin).toHaveBeenCalledWith({ notify: false });
    });

    it('should catch login errors and return null', async () => {
      (QueryService as any).isReady = true;
      vi.mocked(QueryService.autoLogin).mockReturnValueOnce(throwError(() => new Error('login failed')) as any);

      const result = await firstValueFrom(restoreLoginSate());
      expect(result).toBeNull();
    });
  });

  describe('restoreLocalSate', () => {
    it('should restore state from local storage and dispatch restoreState with logged:false', async () => {
      const savedState = { logged: true, someData: 'value' };
      vi.mocked(localGet).mockReturnValue(of(savedState) as any);
      (QueryService as any).isReady = false;

      await firstValueFrom(restoreLocalSate(store));

      expect(restoreState).toHaveBeenCalledWith({ ...savedState, logged: false });
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should catch errors during restore and return null', async () => {
      vi.mocked(localGet).mockReturnValue(throwError(() => new Error('storage error')) as any);

      const result = await firstValueFrom(restoreLocalSate(store));
      expect(result).toBeNull();
    });

    it('should resume the session saved in session storage', async () => {
      vi.mocked(localGet).mockReturnValue(of({}) as any);
      (QueryService as any).isReady = true;
      (chrome.storage as any).session = { get: vi.fn(async () => Promise.resolve({ sid: 'saved-sid' })) };

      await firstValueFrom(restoreLocalSate(store));

      expect(QueryService.setSid).toHaveBeenCalledWith('saved-sid');
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'SET_LOGGED', payload: true });
      expect(QueryService.autoLogin).not.toHaveBeenCalled();
      delete (chrome.storage as any).session;
    });
  });

  describe('restoreSession', () => {
    it('should auto-login when there is no saved sid', async () => {
      (QueryService as any).isReady = true;

      await firstValueFrom(restoreSession(store));

      expect(QueryService.getInfo).not.toHaveBeenCalled();
      expect(QueryService.autoLogin).toHaveBeenCalledWith({ notify: false });
    });

    it('should restore the sid and logged state when the session is still valid', async () => {
      (QueryService as any).isReady = true;

      const result = await firstValueFrom(restoreSession(store, 'saved-sid'));

      expect(result).toBeNull();
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'SET_SID', payload: 'saved-sid' });
      expect(store.dispatch).toHaveBeenCalledWith({ type: 'SET_LOGGED', payload: true });
      expect(QueryService.autoLogin).not.toHaveBeenCalled();
    });

    it('should clear the sid and fall back to auto-login when the session expired', async () => {
      (QueryService as any).isReady = true;
      vi.mocked(QueryService.getInfo).mockReturnValueOnce(throwError(() => new Error('session timeout')) as any);

      await firstValueFrom(restoreSession(store, 'expired-sid'));

      expect(store.dispatch).toHaveBeenCalledWith({ type: 'SET_SID', payload: undefined });
      expect(store.dispatch).toHaveBeenLastCalledWith({ type: 'SET_LOGGED', payload: false });
      expect(QueryService.setSid).toHaveBeenLastCalledWith(undefined);
      expect(QueryService.autoLogin).toHaveBeenCalledWith({ notify: false });
    });
  });
});
