/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SynologyFileService } from './synology-file.service';
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

describe('synologyFileService', () => {
  let service: SynologyFileService;
  let doSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    doSpy = vi.spyOn(SynologyService.prototype, 'do').mockReturnValue(of('mock-response'));
    service = new SynologyFileService(true, 'TestFileService');
  });

  describe('constructor', () => {
    it('should default name to SynologyFileService', () => {
      const svc = new SynologyFileService(true);
      expect((svc as any).name).toBe('SynologyFileService');
    });
  });

  describe('_do', () => {
    it('should call super.do with FileStation List defaults', async () => {
      await firstValueFrom(service._do('POST' as any, { method: 'list_share' }));

      expect(doSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          params: { method: 'list_share' },
          version: '2',
          api: 'SYNO.FileStation.List',
          endpoint: 'entry.cgi',
        }),
      );
    });
  });

  describe('listFolder', () => {
    it('should call _do with list_share method and no extra params by default', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFolder());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'list_share' });
    });

    it('should include offset and limit when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFolder(5, 20));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'list_share',
          offset: '5',
          limit: '20',
        }),
      );
    });

    it('should include onlywritable when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFolder(undefined, undefined, true));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          onlywritable: 'true',
        }),
      );
    });

    it('should include sort_by and sort_direction when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFolder(undefined, undefined, undefined, 'name' as any, 'asc'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          sort_by: 'name',
          sort_direction: 'asc',
        }),
      );
    });

    it('should include additional when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFolder(undefined, undefined, undefined, undefined, undefined, ['real_path', 'size'] as any));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          additional: 'real_path,size',
        }),
      );
    });
  });

  describe('listFile', () => {
    it('should set folder_path in params', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFile('/shared/folder'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'list',
          folder_path: '/shared/folder',
        }),
      );
    });

    it('should include offset, limit, filetype when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFile('/shared', 10, 50, 'file'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          offset: '10',
          limit: '50',
          filetype: 'file',
        }),
      );
    });

    it('should include additional, sort_by, sort_direction, and pattern', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.listFile('/shared', undefined, undefined, undefined, ['size'] as any, 'name' as any, 'dsc', '*.txt'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          sort_by: 'name',
          sort_direction: 'dsc',
          pattern: '*.txt',
          additional: 'size',
        }),
      );
    });
  });

  describe('createFolder', () => {
    it('should format folder_path with brackets and leading slashes', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder('/shared', 'new-folder'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'create',
          folder_path: '["/shared"]',
          name: '["new-folder"]',
        }),
        '2',
        'SYNO.FileStation.CreateFolder',
      );
    });

    it('should add leading slash when folder_path does not start with /', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder('shared', 'new-folder'));

      const params = _doSpy.mock.calls[0][1];
      expect(params.folder_path).toBe('["/shared"]');
    });

    it('should handle arrays of folder_path and name', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder(['/shared', 'other'], ['folder1', 'folder2']));

      const params = _doSpy.mock.calls[0][1];
      expect(params.folder_path).toBe('["/shared","/other"]');
      expect(params.name).toBe('["folder1","folder2"]');
    });

    it('should include force_parent when true', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder('/shared', 'folder', true));

      const params = _doSpy.mock.calls[0][1];
      expect(params.force_parent).toBe('true');
    });

    it('should not include force_parent when false (default)', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder('/shared', 'folder'));

      const params = _doSpy.mock.calls[0][1];
      expect(params).not.toHaveProperty('force_parent');
    });

    it('should include additional when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.createFolder('/shared', 'folder', false, ['real_path'] as any));

      const params = _doSpy.mock.calls[0][1];
      expect(params.additional).toBe('real_path');
    });
  });

  describe('renameFolder', () => {
    it('should format path with brackets and leading slashes', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.renameFolder('/shared/old', 'new-name'));

      expect(_doSpy).toHaveBeenCalledWith(
        'POST',
        expect.objectContaining({
          method: 'rename',
          path: '["/shared/old"]',
          name: '["new-name"]',
        }),
        '2',
        'SYNO.FileStation.Rename',
      );
    });

    it('should add leading slash when path does not start with /', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.renameFolder('shared/old', 'new-name'));

      const params = _doSpy.mock.calls[0][1];
      expect(params.path).toBe('["/shared/old"]');
    });

    it('should handle arrays of path and name', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.renameFolder(['/shared/a', 'shared/b'], ['name-a', 'name-b']));

      const params = _doSpy.mock.calls[0][1];
      expect(params.path).toBe('["/shared/a","/shared/b"]');
      expect(params.name).toBe('["name-a","name-b"]');
    });

    it('should include additional when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.renameFolder('/shared/old', 'new-name', ['size'] as any));

      const params = _doSpy.mock.calls[0][1];
      expect(params.additional).toBe('size');
    });

    it('should include search_taskid when provided', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.renameFolder('/shared/old', 'new-name', undefined, 'task-123'));

      const params = _doSpy.mock.calls[0][1];
      expect(params.search_taskid).toBe('task-123');
    });
  });

  describe('info', () => {
    it('should call _do with get method and Info API', async () => {
      const _doSpy = vi.spyOn(service, '_do').mockReturnValue(of({} as any));
      await firstValueFrom(service.info());

      expect(_doSpy).toHaveBeenCalledWith('POST', { method: 'get' }, '2', 'SYNO.FileStation.Info');
    });
  });
});
