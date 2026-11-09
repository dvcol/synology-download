/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment */
import type { Credentials } from '../../models/settings.model';
import type { LoginRequest } from '../../models/synology.model';

import { lastValueFrom, of } from 'rxjs';

import { ConnectionType, Protocol } from '../../models/settings.model';
import { syncConnection } from '../../store/actions/settings.action';
import { store } from '../../store/store';
import * as module from './query.service';
import { QueryService } from './query.service';

describe('query.service', () => {
  it('is importable', () => {
    expect(module).toBeTruthy();
  });

  it('exports QueryService', () => {
    expect(module.QueryService).toBeTruthy();
  });

  describe('two factor login', () => {
    const baseUrl = 'https://nas.example.com/';
    const base: Credentials = { type: ConnectionType.twoFactor, username: 'user', password: 'pass', authVersion: 7, device_name: 'Brave' };

    let login: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      login = vi.fn(() => of({ sid: 'sid', did: 'new-did' }));
      (QueryService as any).authClient.login = login;
    });

    const sentRequest = async (credentials: Credentials): Promise<LoginRequest> => {
      await lastValueFrom(QueryService.login(credentials, baseUrl));
      return login.mock.calls[0][0] as LoginRequest;
    };

    it('sends the typed code and asks for a new device token even when a device id is saved', async () => {
      expect.assertions(3);
      const request = await sentRequest({ ...base, enable_device_token: true, device_id: 'stale-did', otp_code: '123456' });
      expect(request.otp_code).toBe('123456');
      expect(request.enable_device_token).toBe('yes');
      expect(request.device_id).toBeUndefined();
    });

    it('uses the saved device id when no code is typed', async () => {
      expect.assertions(2);
      const request = await sentRequest({ ...base, enable_device_token: true, device_id: 'saved-did', otp_code: '' });
      expect(request.device_id).toBe('saved-did');
      expect(request.otp_code).toBeUndefined();
    });

    it('asks for a device token on first login', async () => {
      expect.assertions(2);
      const request = await sentRequest({ ...base, enable_device_token: true, device_id: '', otp_code: '123456' });
      expect(request.otp_code).toBe('123456');
      expect(request.enable_device_token).toBe('yes');
    });

    it('never replays a previously typed code on auto-login', async () => {
      expect.assertions(2);
      store.dispatch(
        syncConnection({
          ...base,
          protocol: Protocol.https,
          path: 'nas.example.com',
          port: 443,
          rememberMe: true,
          autoLogin: true,
          enable_device_token: true,
          device_id: 'saved-did',
          otp_code: 'used-code',
        }),
      );
      await lastValueFrom(QueryService.autoLogin({ logged: false, notify: false }));
      const request = login.mock.calls[0][0];
      expect(request.otp_code).toBeUndefined();
      expect(request.device_id).toBe('saved-did');
    });

    it('sends only the code without device token', async () => {
      expect.assertions(2);
      const request = await sentRequest({ ...base, enable_device_token: false, otp_code: '123456' });
      expect(request.otp_code).toBe('123456');
      expect(request.enable_device_token).toBeUndefined();
    });
  });
});
