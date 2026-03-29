/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SynologyAuthService } from './synology-auth.service';
import { SynologyService } from './synology.service';

vi.mock('../../utils/webex.utils', () => ({
  rxFetch: vi.fn(() => of({ success: true, data: 'result' })),
  HttpMethod: { GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', get: 'get', post: 'post', put: 'put', delete: 'delete' },
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  isMacOs: vi.fn(() => false),
}));

vi.mock('../../utils/chrome/chrome-message.utils', () => ({
  onMessage: vi.fn(() => ({ subscribe: vi.fn() })),
  sendMessage: vi.fn(() => of({ success: true, payload: 'forwarded' })),
}));

vi.mock('../../utils/string.utils', () => ({
  stringifyParams: vi.fn((params: any) => JSON.stringify(params)),
}));

vi.mock('../../models/error.model', () => ({
  SynologyError: class SynologyError extends Error {
    constructor(api: string, _error: any) {
      super(`SynologyError: ${api}`);
      this.name = 'SynologyError';
    }
  },
}));

vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('synologyAuthService', () => {
  let service: SynologyAuthService;
  let doSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    doSpy = vi.spyOn(SynologyService.prototype, 'do').mockReturnValue(of('mock-response'));
    service = new SynologyAuthService(true, 'TestAuthService');
  });

  describe('constructor', () => {
    it('should create an instance with defaults', () => {
      const svc = new SynologyAuthService(true);
      expect((svc as any).name).toBe('SynologyAuthService');
      expect((svc as any).isProxy).toBe(true);
    });
  });

  describe('_do', () => {
    it('should call super.do with Auth API defaults', async () => {
      await firstValueFrom(service._do('POST' as any, { method: 'login' }));

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          params: { method: 'login' },
          version: '1',
          api: 'SYNO.API.Auth',
          endpoint: 'auth.cgi',
        }),
        false,
      );
    });

    it('should allow overriding version and api', async () => {
      await firstValueFrom(
        service._do('GET' as any, { method: 'query' }, {
          version: '3',
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
        }),
      );

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '3',
          api: 'SYNO.API.Info',
          endpoint: 'query.cgi',
        }),
        false,
      );
    });

    it('should pass baseUrl as base option', async () => {
      await firstValueFrom(
        service._do('POST' as any, { method: 'login' }, { baseUrl: 'http://nas:5000/' }),
      );

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          base: 'http://nas:5000/',
        }),
        false,
      );
    });

    it('should forward doNotProxy option', async () => {
      await firstValueFrom(
        service._do('POST' as any, { method: 'login' }, { doNotProxy: true }),
      );

      expect(doSpy).toHaveBeenCalledWith(expect.anything(), true);
    });
  });

  describe('login', () => {
    it('should build correct params with account and passwd', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret' }),
      );

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'login',
          session: 'DownloadStation',
          format: 'cookie',
          account: 'admin',
          passwd: 'secret',
        }),
        expect.objectContaining({ version: '3' }),
      );
    });

    it('should include otp_code when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret', otp_code: '123456' }),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).toHaveProperty('otp_code', '123456');
    });

    it('should include enable_device_token when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret', enable_device_token: 'yes' }),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).toHaveProperty('enable_device_token', 'yes');
    });

    it('should include device_name and device_id when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({
          account: 'admin',
          passwd: 'secret',
          device_name: 'my-device',
          device_id: 'dev-123',
        }),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).toHaveProperty('device_name', 'my-device');
      expect(params).toHaveProperty('device_id', 'dev-123');
    });

    it('should use custom format when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret', format: 'sid' }),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).toHaveProperty('format', 'sid');
    });

    it('should pass baseUrl and version to _do', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret', baseUrl: 'http://nas/' }, '6'),
      );

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.anything(),
        expect.objectContaining({ baseUrl: 'http://nas/', version: '6' }),
      );
    });

    it('should pass doNotProxy to _do', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({ sid: 'abc' } as any));

      await firstValueFrom(
        service.login({ account: 'admin', passwd: 'secret' }, '3', true),
      );

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.anything(),
        expect.objectContaining({ doNotProxy: true }),
      );
    });
  });

  describe('logout', () => {
    it('should call _do with logout method and DownloadStation session', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of(undefined as any));

      await firstValueFrom(service.logout());

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'logout',
          session: 'DownloadStation',
        }),
      );
    });
  });
});
