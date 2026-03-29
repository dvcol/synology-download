/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SynologyInfoService } from './synology-info.service';
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

describe('synologyInfoService', () => {
  let service: SynologyInfoService;
  let doSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    doSpy = vi.spyOn(SynologyService.prototype, 'do').mockReturnValue(of('mock-response'));
    service = new SynologyInfoService(true, 'TestInfoService');
  });

  describe('constructor', () => {
    it('should default name to SynologyInfoService', () => {
      const svc = new SynologyInfoService(true);
      expect((svc as any).name).toBe('SynologyInfoService');
    });
  });

  describe('_do', () => {
    it('should call super.do with Info API defaults', async () => {
      await firstValueFrom(service._do('POST' as any, { method: 'query' }));

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          params: { method: 'query' },
          version: '1',
          api: 'SYNO.API.Info',
          endpoint: 'query.cgi',
        }),
        false,
      );
    });

    it('should pass baseUrl as base option', async () => {
      await firstValueFrom(
        service._do('POST' as any, { method: 'query' }, { baseUrl: 'http://nas:5000/' }),
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
        service._do('POST' as any, { method: 'query' }, { doNotProxy: true }),
      );

      expect(doSpy).toHaveBeenCalledWith(expect.anything(), true);
    });
  });

  describe('info', () => {
    it('should query with ALL by default', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info());

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'query',
          query: 'ALL',
        }),
        expect.objectContaining({ doNotProxy: false }),
      );
    });

    it('should pass custom query', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info(undefined, { query: ['SYNO.API.Auth', 'SYNO.API.Info'] }));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          query: 'SYNO.API.Auth,SYNO.API.Info',
        }),
        expect.anything(),
      );
    });

    it('should pass baseUrl to _do', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info('http://nas:5000/'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.anything(),
        expect.objectContaining({ baseUrl: 'http://nas:5000/' }),
      );
    });

    it('should pass doNotProxy to _do', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info(undefined, { doNotProxy: true }));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.anything(),
        expect.objectContaining({ doNotProxy: true }),
      );
    });
  });
});
