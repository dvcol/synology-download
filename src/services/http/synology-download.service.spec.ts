/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SynologyDownloadService } from './synology-download.service';
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
  sanitizeUrl: vi.fn((url: string) => `sanitized-${url}`),
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

describe('synologyDownloadService', () => {
  let service: SynologyDownloadService;
  let doSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    doSpy = vi.spyOn(SynologyService.prototype, 'do').mockReturnValue(of('mock-response'));
    service = new SynologyDownloadService(true, 'TestDownloadService');
  });

  describe('constructor', () => {
    it('should default to DownloadStation prefix', () => {
      const svc = new SynologyDownloadService(true);
      expect((svc as any).prefix).toBe('webapi/DownloadStation');
    });
  });

  describe('_do', () => {
    it('should call super.do with DownloadStation Task defaults', async () => {
      await firstValueFrom(service._do('POST' as any, { method: 'list' }));

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          params: { method: 'list' },
          version: '1',
          api: 'SYNO.DownloadStation.Task',
          endpoint: 'task.cgi',
        }),
      );
    });

    it('should allow overriding version, api, and endpoint', async () => {
      await firstValueFrom(
        service._do('POST' as any, { method: 'getinfo' }, '2', 'SYNO.DownloadStation.Info' as any, 'info.cgi' as any),
      );

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          version: '2',
          api: 'SYNO.DownloadStation.Info',
          endpoint: 'info.cgi',
        }),
      );
    });
  });

  describe('getConfig', () => {
    it('should call _do with getconfig method and Info API', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.getConfig());

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        { method: 'getconfig' },
        '1',
        'SYNO.DownloadStation.Info',
        'info.cgi',
      );
    });
  });

  describe('setConfig', () => {
    it('should stringify config values and call _do', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.setConfig({ default_destination: '/downloads' } as any));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'setserverconfig',
          default_destination: '/downloads',
        }),
        '1',
        'SYNO.DownloadStation.Info',
        'info.cgi',
      );
    });

    it('should skip undefined and null config values', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.setConfig({ default_destination: '/dl', emule_enabled: undefined } as any));

      const params = _doSpy.mock.calls[0][1];
      expect(params).not.toHaveProperty('emule_enabled');
    });
  });

  describe('getInfo', () => {
    it('should call _do with getinfo method and Info API', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.getInfo());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'getinfo' }, '1', 'SYNO.DownloadStation.Info', 'info.cgi');
    });
  });

  describe('getStatistic', () => {
    it('should call _do with Statistic API and endpoint', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.getStatistic());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'getinfo' }, '1', 'SYNO.DownloadStation.Statistic', 'statistic.cgi');
    });
  });

  describe('listTasks', () => {
    it('should call _do with list method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listTasks());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'list' });
    });

    it('should include offset and limit when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listTasks(10, 25));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'list',
          offset: '10',
          limit: '25',
        }),
      );
    });

    it('should include additional when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listTasks(undefined, undefined, ['detail', 'transfer'] as any));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'list',
          additional: 'detail,transfer',
        }),
      );
    });
  });

  describe('createTask', () => {
    it('should sanitize URLs and join with comma', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of(undefined as any));

      await firstValueFrom(
        service.createTask({
          url: ['http://example.com/file1', 'http://example.com/file2'],
          destination: '/downloads',
        } as any),
      );

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'create',
          uri: 'sanitized-http://example.com/file1,sanitized-http://example.com/file2',
          destination: '/downloads',
        }),
      );
    });

    it('should include username, password, and extract_password when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of(undefined as any));

      await firstValueFrom(
        service.createTask({
          url: ['http://example.com/file'],
          destination: '/dl',
          username: 'user',
          password: 'pass',
          extract_password: 'zip-pass',
        } as any),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).toHaveProperty('username', 'user');
      expect(params).toHaveProperty('password', 'pass');
      expect(params).toHaveProperty('unzip', 'zip-pass');
    });

    it('should not set uri when url array is empty', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of(undefined as any));

      await firstValueFrom(
        service.createTask({ url: [], destination: '/dl' } as any),
      );

      const params = _doSpy.mock.calls[0][1];
      expect(params).not.toHaveProperty('uri');
    });
  });

  describe('deleteTask', () => {
    it('should call _do with PUT, delete method, and id', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.deleteTask('task-1'));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          method: 'delete',
          id: 'task-1',
          force_complete: 'false',
        }),
      );
    });

    it('should set force_complete to true when force is true', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.deleteTask('task-1', true));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          force_complete: 'true',
        }),
      );
    });

    it('should accept an array of ids', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.deleteTask(['task-1', 'task-2']));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          id: ['task-1', 'task-2'],
        }),
      );
    });
  });

  describe('pauseTask', () => {
    it('should call _do with PUT and pause method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.pauseTask('task-1'));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          method: 'pause',
          id: 'task-1',
        }),
      );
    });
  });

  describe('resumeTask', () => {
    it('should call _do with PUT and resume method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.resumeTask('task-1'));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          method: 'resume',
          id: 'task-1',
        }),
      );
    });
  });

  describe('editTask', () => {
    it('should call _do with PUT, edit method, destination, and version 2', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.editTask('task-1', '/new-dest'));

      expect(_doSpy).toHaveBeenCalledWith(
        'PUT',
        expect.objectContaining({
          method: 'edit',
          id: 'task-1',
          destination: '/new-dest',
        }),
        '2',
      );
    });
  });

  describe('info', () => {
    it('should call _do with getinfo method and Info API', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'getinfo' }, '1', 'SYNO.DownloadStation.Info', 'info.cgi');
    });
  });
});
