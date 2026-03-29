/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-argument */
import type { StoreOrProxy } from '../../../models/store.model';

import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { QueryService } from '../../../services/query/query.service';
import { restoreState } from '../../../store/actions/state.action';
import { localGet } from '../../../utils/webex.utils';
import { restoreLocalSate, restoreLoginSate } from './state-handler';

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
    init: vi.fn(),
    isLoggedIn: false,
  },
}));

vi.mock('../../../store/actions/state.action', () => ({
  restoreState: vi.fn((v: unknown) => ({ type: 'RESTORE_STATE', payload: v })),
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
  });
});
