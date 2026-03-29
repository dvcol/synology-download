/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendMessage } from '../../utils/chrome/chrome-message.utils';
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
    api: string;
    error: any;
    constructor(api: string, error: any) {
      super(`SynologyError: ${api}`);
      this.name = 'SynologyError';
      this.api = api;
      this.error = error;
    }
  },
}));

vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

describe('synologyService', () => {
  let service: SynologyService;

  beforeEach(() => {
    vi.clearAllMocks();
    // isProxy=true to skip listen() in constructor
    service = new SynologyService(true, 'TestService', 'webapi');
  });

  describe('constructor', () => {
    it('should set the prefix as baseUrl via super()', () => {
      expect((service as any).baseUrl).toBe('webapi');
    });

    it('should store isProxy, name, and prefix', () => {
      expect((service as any).isProxy).toBe(true);
      expect((service as any).name).toBe('TestService');
      expect((service as any).prefix).toBe('webapi');
    });

    it('should call listen when isProxy is false', () => {
      const listenSpy = vi.spyOn(SynologyService.prototype, 'listen');
      void new SynologyService(false, 'ListenTest');
      expect(listenSpy).toHaveBeenCalled();
      listenSpy.mockRestore();
    });
  });

  describe('setBaseUrl', () => {
    it('should concatenate baseUrl with prefix', () => {
      service.setBaseUrl('http://nas:5000/');
      expect((service as any).baseUrl).toBe('http://nas:5000/webapi');
    });
  });

  describe('setSid', () => {
    it('should store the sid', () => {
      service.setSid('my-session-id');
      expect((service as any).sid).toBe('my-session-id');
    });

    it('should clear sid when called with undefined', () => {
      service.setSid('some-id');
      service.setSid(undefined);
      expect((service as any).sid).toBeUndefined();
    });
  });

  describe('query', () => {
    it('should call get by default (GET method)', async () => {
      const getSpy = vi.spyOn(service, 'get');
      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
          params: { method: 'query' },
        }),
      );

      expect(getSpy).toHaveBeenCalled();
    });

    it('should call post when method is POST', async () => {
      const postSpy = vi.spyOn(service, 'post');
      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Auth' as any,
          endpoint: 'auth.cgi' as any,
          method: 'POST' as any,
          version: '1',
          params: { method: 'login' },
        }),
      );

      expect(postSpy).toHaveBeenCalled();
    });

    it('should call put when method is PUT', async () => {
      const putSpy = vi.spyOn(service, 'put');
      await firstValueFrom(
        service.query({
          api: 'SYNO.DownloadStation.Task' as any,
          endpoint: 'task.cgi' as any,
          method: 'PUT' as any,
          version: '1',
          params: { method: 'delete' },
        }),
      );

      expect(putSpy).toHaveBeenCalled();
    });

    it('should call delete when method is DELETE', async () => {
      const deleteSpy = vi.spyOn(service, 'delete');
      await firstValueFrom(
        service.query({
          api: 'SYNO.DownloadStation.Task' as any,
          endpoint: 'task.cgi' as any,
          method: 'DELETE' as any,
          version: '1',
          params: { method: 'delete' },
        }),
      );

      expect(deleteSpy).toHaveBeenCalled();
    });

    it('should inject _sid when sid is set and method is not login', async () => {
      service.setSid('test-sid');
      const getSpy = vi.spyOn(service, 'get');

      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
          params: { method: 'query' },
        }),
      );

      expect(getSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ _sid: 'test-sid' }),
        expect.anything(),
      );
    });

    it('should not inject _sid when method is login', async () => {
      service.setSid('test-sid');
      const postSpy = vi.spyOn(service, 'post');

      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Auth' as any,
          endpoint: 'auth.cgi' as any,
          method: 'POST' as any,
          version: '1',
          params: { method: 'login' },
        }),
      );

      const bodyArg = postSpy.mock.calls[0][1];
      expect(String(bodyArg)).not.toContain('_sid');
    });

    it('should add Credentials header when sid is set', async () => {
      service.setSid('my-sid');
      const postSpy = vi.spyOn(service, 'post');

      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Auth' as any,
          endpoint: 'auth.cgi' as any,
          method: 'POST' as any,
          version: '1',
          params: { method: 'query' },
        }),
      );

      const headers = postSpy.mock.calls[0][3];
      expect(headers).toHaveProperty('Credentials', 'omit');
    });

    it('should set Content-Type header when no body is provided', async () => {
      const getSpy = vi.spyOn(service, 'get');

      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
          params: { method: 'query' },
        }),
      );

      const headers = getSpy.mock.calls[0][2];
      expect(headers).toHaveProperty('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    });

    it('should use base + prefix as url when base is provided', async () => {
      const getSpy = vi.spyOn(service, 'get');

      await firstValueFrom(
        service.query({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
          params: { method: 'query' },
          base: 'http://custom:5000/',
        }),
      );

      const urlArg = getSpy.mock.calls[0][0];
      expect(urlArg).toEqual({ base: 'http://custom:5000/webapi', path: 'query.cgi' });
    });
  });

  describe('forward', () => {
    it('should send a chrome message with the service name and args', async () => {
      const options: any = {
        api: 'SYNO.API.Info',
        endpoint: 'query.cgi',
        method: 'GET',
        version: '1',
      };

      await firstValueFrom(service.forward(options));

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'query',
          payload: { id: 'TestService', args: [options] },
        }),
      );
    });
  });

  describe('do', () => {
    it('should return data when response success is true', async () => {
      vi.spyOn(service, 'forward').mockReturnValue(of({ success: true, data: 'the-data' } as any));

      const result = await firstValueFrom(
        service.do({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
        }),
      );

      expect(result).toBe('the-data');
    });

    it('should throw SynologyError when response success is false', async () => {
      vi.spyOn(service, 'forward').mockReturnValue(of({ success: false, error: { code: 100 } } as any));

      await expect(
        firstValueFrom(
          service.do({
            api: 'SYNO.API.Info' as any,
            endpoint: 'query.cgi' as any,
            method: 'GET' as any,
            version: '1',
          }),
        ),
      ).rejects.toThrow('SynologyError');
    });

    it('should call forward when isProxy is true and doNotProxy is not set', async () => {
      const forwardSpy = vi.spyOn(service, 'forward').mockReturnValue(of({ success: true, data: 'proxied' } as any));

      await firstValueFrom(
        service.do({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
        }),
      );

      expect(forwardSpy).toHaveBeenCalled();
    });

    it('should call query when doNotProxy is true even if isProxy', async () => {
      const querySpy = vi.spyOn(service, 'query').mockReturnValue(of({ success: true, data: 'queried' } as any));

      await firstValueFrom(
        service.do(
          {
            api: 'SYNO.API.Info' as any,
            endpoint: 'query.cgi' as any,
            method: 'GET' as any,
            version: '1',
          },
          true,
        ),
      );

      expect(querySpy).toHaveBeenCalled();
    });

    it('should return response as-is when success is neither true nor false', async () => {
      vi.spyOn(service, 'forward').mockReturnValue(of('raw-response' as any));

      const result = await firstValueFrom(
        service.do({
          api: 'SYNO.API.Info' as any,
          endpoint: 'query.cgi' as any,
          method: 'GET' as any,
          version: '1',
        }),
      );

      expect(result).toBe('raw-response');
    });
  });
});
