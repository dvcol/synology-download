/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SynologyDownload2Service } from './synology-download2.service';
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
  stringifyKeys: vi.fn((obj: any, skipFalsy?: boolean) => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (skipFalsy && !value) continue;
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return result;
  }),
  sanitizeUrl: vi.fn((url: string) => `sanitized-${url}`),
  buildFormData: vi.fn((params: any) => {
    const fd = new FormData();
    for (const [key, value] of Object.entries(params)) {
      fd.append(key, value as string);
    }
    return fd;
  }),
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

describe('synologyDownload2Service', () => {
  let service: SynologyDownload2Service;
  let doSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    doSpy = vi.spyOn(SynologyService.prototype, 'do').mockReturnValue(of('mock-response'));
    service = new SynologyDownload2Service(true, 'TestDownload2Service');
  });

  describe('constructor', () => {
    it('should default name to SynologyDownloadService2', () => {
      const svc = new SynologyDownload2Service(true);
      expect((svc as any).name).toBe('SynologyDownloadService2');
    });
  });

  describe('_do', () => {
    it('should call super.do with DownloadStation2 Task defaults', async () => {
      await firstValueFrom(service._do({ method: 'POST' as any, params: { method: 'list' } }));

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          api: 'SYNO.DownloadStation2.Task',
          method: 'POST',
          version: '1',
          endpoint: 'entry.cgi',
          params: { method: 'list' },
        }),
        undefined,
      );
    });

    it('should allow overriding api, version, and endpoint', async () => {
      await firstValueFrom(
        service._do({
          method: 'POST' as any,
          api: 'SYNO.DownloadStation2.Task.BT' as any,
          version: '2',
          endpoint: 'entry.cgi' as any,
          params: { method: 'get' },
        }),
      );

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          api: 'SYNO.DownloadStation2.Task.BT',
          version: '2',
        }),
        undefined,
      );
    });

    it('should forward doNotProxy', async () => {
      await firstValueFrom(service._do({ method: 'POST' as any }, true));

      expect(doSpy).toHaveBeenCalledWith(expect.anything(), true);
    });
  });

  describe('createTask', () => {
    it('should sanitize URLs and stringify them as JSON', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(
        service.createTask({
          url: ['http://example.com/file1', 'http://example.com/file2'],
          destination: '/downloads',
          create_list: false,
        } as any),
      );

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.params).toHaveProperty('url', JSON.stringify(['sanitized-http://example.com/file1', 'sanitized-http://example.com/file2']));
      expect(callArgs).toHaveProperty('api', 'SYNO.DownloadStation2.Task');
      expect(callArgs).toHaveProperty('version', '2');
    });

    it('should use FormData body when torrent is provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      const torrent = new Blob(['torrent-data'], { type: 'application/x-bittorrent' });
      Object.defineProperty(torrent, 'size', { value: 1234 });

      await firstValueFrom(
        service.createTask({
          destination: '/downloads',
          create_list: true,
          torrent,
        } as any),
      );

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.body).toBeInstanceOf(FormData);
      // doNotProxy should be true for torrent
      expect(_doSpy.mock.calls[0][1]).toBe(true);
    });

    it('should set params with create method when no torrent', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(
        service.createTask({
          url: ['http://example.com/file'],
          destination: '/downloads',
          create_list: false,
        } as any),
      );

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.params).toHaveProperty('method', 'create');
    });

    it('should not set doNotProxy for non-torrent requests', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(
        service.createTask({
          url: ['http://example.com/file'],
          destination: '/dl',
          create_list: false,
        } as any),
      );

      expect(_doSpy.mock.calls[0][1]).toBe(false);
    });
  });

  describe('getTaskFiles', () => {
    it('should call _do with TaskBtFile API and list method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(
        service.getTaskFiles({
          task_id: 'task-1',
          offset: 0,
          limit: 50,
          order_by: 'name' as any,
          order: 'ASC',
        }),
      );

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.BT.File');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toHaveProperty('method', 'list');
    });
  });

  describe('getTaskList', () => {
    it('should call _do with TaskList API and get method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.getTaskList('list-123'));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.List');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toEqual(
        expect.objectContaining({ method: 'get', list_id: 'list-123' }),
      );
    });
  });

  describe('setTaskListDownload', () => {
    it('should call _do with TaskListPolling API and download method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(
        service.setTaskListDownload({
          list_id: 'list-1',
          selected: [0, 1],
          destination: '/dl',
        }),
      );

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.List.Polling');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toHaveProperty('method', 'download');
    });
  });

  describe('deleteTaskList', () => {
    it('should call _do with EntryAPI.request and compound param', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.deleteTaskList('list-123'));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.Entry.Request');
      expect(callArgs.version).toBe('1');
      expect(callArgs.params).toHaveProperty('method', 'request');
      expect(callArgs.params).toHaveProperty('compound');
      const compound = JSON.parse(callArgs.params.compound);
      expect(compound).toEqual([
        expect.objectContaining({
          api: 'SYNO.DownloadStation2.Task.List',
          method: 'delete',
          version: '2',
          list_id: 'list-123',
        }),
      ]);
    });
  });

  describe('stopTask', () => {
    it('should call _do with TaskComplete API and start method for a single id', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.stopTask('task-1'));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.Complete');
      expect(callArgs.version).toBe('1');
      expect(callArgs.params).toEqual(
        expect.objectContaining({ method: 'start', id: ['task-1'] }),
      );
    });

    it('should pass array of ids as-is', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.stopTask(['task-1', 'task-2']));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.params.id).toEqual(['task-1', 'task-2']);
    });
  });

  describe('getTaskEdit', () => {
    it('should call _do with TaskBt API and get method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));

      await firstValueFrom(service.getTaskEdit('task-1'));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.BT');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toEqual(
        expect.objectContaining({ method: 'get', task_id: 'task-1' }),
      );
    });
  });

  describe('editTask', () => {
    it('should call _do with Task API and edit method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.editTask({ id: ['task-1'], destination: '/new-dest' }));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toHaveProperty('method', 'edit');
    });
  });

  describe('editTaskBt', () => {
    it('should call _do with TaskBt API and set method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.editTaskBt({ task_id: 'task-1', max_peers: 50 }));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.BT');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toHaveProperty('method', 'set');
    });
  });

  describe('editFile', () => {
    it('should call _do with TaskBtFile API and set method', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of([] as any));

      await firstValueFrom(service.editFile({ task_id: 'task-1', index: [0, 1], wanted: true }));

      const callArgs = _doSpy.mock.calls[0][0];
      expect(callArgs.api).toBe('SYNO.DownloadStation2.Task.BT.File');
      expect(callArgs.version).toBe('2');
      expect(callArgs.params).toHaveProperty('method', 'set');
    });
  });
});
