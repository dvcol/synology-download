/* eslint-disable ts/no-unsafe-member-access */
import type { Credentials } from '../../models/settings.model';
import type { LoginRequest } from '../../models/synology.model';

import { lastValueFrom, of } from 'rxjs';

import { ConnectionType } from '../../models/settings.model';
import * as module from './query.service';
import { QueryService } from './query.service';

vi.mock('../../utils/crypto.utils', () => ({
  decryptPassword: vi.fn(async (value?: string) => {
    if (value === 'aesgcm.v1:broken') throw new Error('OperationError');
    return value?.startsWith('aesgcm.v1:') ? 'decrypted-pass' : value;
  }),
}));

describe('query.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports QueryService', () => {
    expect(module.QueryService).toBeTruthy();
  });

  describe('login password', () => {
    const baseUrl = 'https://nas.example.com/';
    const base: Credentials = { type: ConnectionType.local, username: 'user', authVersion: 7 };

    let login: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      login = vi.fn(() => of({ sid: 'sid' }));
      (QueryService as any).authClient.login = login;
    });

    it('decrypts a stored password only for the request', async () => {
      expect.assertions(1);
      await lastValueFrom(QueryService.login({ ...base, password: 'aesgcm.v1:cipher' }, baseUrl));
      expect((login.mock.calls[0][0] as LoginRequest).passwd).toBe('decrypted-pass');
    });

    it('keeps sending legacy plain passwords', async () => {
      expect.assertions(1);
      await lastValueFrom(QueryService.login({ ...base, password: 'plain-pass' }, baseUrl));
      expect((login.mock.calls[0][0] as LoginRequest).passwd).toBe('plain-pass');
    });

    it('fails with a clear error when the stored password cannot be decrypted', async () => {
      expect.assertions(2);
      await expect(lastValueFrom(QueryService.login({ ...base, password: 'aesgcm.v1:broken' }, baseUrl))).rejects.toThrow('password_decrypt_failed');
      expect(login).not.toHaveBeenCalled();
    });
  });
});
