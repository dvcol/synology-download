/* eslint-disable ts/no-unsafe-member-access */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rxFetch } from '../../utils/webex.utils';
import { BaseHttpService } from './base-http.service';

vi.mock('../../utils/webex.utils', () => ({
  rxFetch: vi.fn(() => of({ data: 'test' })),
  HttpMethod: { GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE' },
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  isMacOs: vi.fn(() => false),
}));

describe('baseHttpService', () => {
  let service: BaseHttpService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BaseHttpService('http://localhost');
  });

  describe('constructor', () => {
    it('should set the baseUrl', () => {
      expect((service as any).baseUrl).toBe('http://localhost');
    });

    it('should default baseUrl to empty string', () => {
      const empty = new BaseHttpService();
      expect((empty as any).baseUrl).toBe('');
    });
  });

  describe('setBaseUrl', () => {
    it('should update the baseUrl', () => {
      service.setBaseUrl('http://newhost');
      expect((service as any).baseUrl).toBe('http://newhost');
    });
  });

  describe('request', () => {
    it('should prepend baseUrl to a string url', async () => {
      await firstValueFrom(service.request({ url: 'api/test' }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({ url: 'http://localhost/api/test' }),
      );
    });

    it('should prepend baseUrl to a URL object url', async () => {
      const urlObj = new URL('http://example.com/path');
      await firstValueFrom(service.request({ url: urlObj }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({ url: `http://localhost/${urlObj}` }),
      );
    });

    it('should return the observable from rxFetch', async () => {
      const result = await firstValueFrom(service.request({ url: 'test' }));
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('get', () => {
    it('should call rxFetch with GET method and prepended url', async () => {
      await firstValueFrom(service.get('endpoint', { key: 'val' }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost/endpoint',
          method: 'GET',
          params: { key: 'val' },
        }),
      );
    });

    it('should pass headers', async () => {
      await firstValueFrom(service.get('endpoint', undefined, { 'X-Custom': 'yes' }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: { 'X-Custom': 'yes' },
        }),
      );
    });
  });

  describe('post', () => {
    it('should call rxFetch with POST method and body', async () => {
      await firstValueFrom(service.post('endpoint', 'body-data', { p: '1' }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost/endpoint',
          method: 'POST',
          body: 'body-data',
          params: { p: '1' },
        }),
      );
    });
  });

  describe('put', () => {
    it('should call rxFetch with PUT method and body', async () => {
      await firstValueFrom(service.put('endpoint', 'put-body'));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost/endpoint',
          method: 'PUT',
          body: 'put-body',
        }),
      );
    });
  });

  describe('delete', () => {
    it('should call rxFetch with DELETE method', async () => {
      await firstValueFrom(service.delete('endpoint', { id: '123' }));

      expect(rxFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'http://localhost/endpoint',
          method: 'DELETE',
          params: { id: '123' },
        }),
      );
    });
  });
});
