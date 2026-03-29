/* eslint-disable ts/no-unsafe-return, ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-argument */
import { firstValueFrom, lastValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendActiveTabMessage } from '../../utils/chrome/chrome-message.utils';
import { QueryService } from '../query/query.service';
import { DownloadService } from './download.service';
import { InterceptService } from './intercept.service';

vi.mock('./download.service', () => ({
  DownloadService: {
    pause: vi.fn(() => of(undefined)),
    resume: vi.fn(() => of(undefined)),
    erase: vi.fn(() => of([])),
  },
}));
vi.mock('../query/query.service', () => ({
  QueryService: {
    init: vi.fn(),
    destroy: vi.fn(),
    createTask: vi.fn(() => of({ success: true })),
  },
}));
vi.mock('../../utils/chrome/chrome-message.utils', () => {
  const makeMockObservable = () => {
    const obs: any = { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) };
    obs.pipe = vi.fn(() => makeMockObservable());
    return obs;
  };
  return {
    onMessage: vi.fn(() => makeMockObservable()),
    sendMessage: vi.fn(() => of({})),
    sendActiveTabMessage: vi.fn(() => of({})),
  };
});
vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const mockDownload = {
  id: 42,
  finalUrl: 'http://example.com/file.zip',
  referrer: 'http://example.com',
  filename: 'path/to/file.zip',
} as any;

describe('interceptService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(DownloadService.pause).mockReturnValue(of(undefined));
    vi.mocked(DownloadService.resume).mockReturnValue(of(undefined));
    vi.mocked(DownloadService.erase).mockReturnValue(of([]));
    vi.mocked(QueryService.createTask).mockReturnValue(of({ success: true }) as any);
  });

  describe('transfer()', () => {
    it('should pause, create task, and erase on complete when erase=true', async () => {
      const callback = vi.fn();

      await lastValueFrom(InterceptService.transfer(mockDownload, { erase: true }, callback));

      expect(DownloadService.pause).toHaveBeenCalledWith(42);
      expect(QueryService.createTask).toHaveBeenCalledWith(
        { url: ['http://example.com/file.zip'] },
        { source: 'http://example.com' },
      );
      expect(callback).toHaveBeenCalled();
      expect(DownloadService.erase).toHaveBeenCalledWith({ id: 42 });
    });

    it('should pause, create task, and NOT erase when erase=false', async () => {
      const callback = vi.fn();

      await lastValueFrom(InterceptService.transfer(mockDownload, { erase: false }, callback));

      expect(DownloadService.pause).toHaveBeenCalledWith(42);
      expect(QueryService.createTask).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(DownloadService.erase).not.toHaveBeenCalled();
    });

    it('should resume on error when resume=true', async () => {
      vi.mocked(QueryService.createTask).mockReturnValue(throwError(() => new Error('task failed')));
      const callback = vi.fn();

      await expect(
        firstValueFrom(InterceptService.transfer(mockDownload, { resume: true }, callback)),
      ).rejects.toThrow('task failed');

      expect(DownloadService.pause).toHaveBeenCalledWith(42);
      expect(callback).toHaveBeenCalled();
      expect(DownloadService.resume).toHaveBeenCalledWith(42);
    });

    it('should erase on error when resume=false and erase=true', async () => {
      vi.mocked(QueryService.createTask).mockReturnValue(throwError(() => new Error('task failed')));
      const callback = vi.fn();

      await expect(
        firstValueFrom(InterceptService.transfer(mockDownload, { erase: true, resume: false }, callback)),
      ).rejects.toThrow('task failed');

      expect(callback).toHaveBeenCalled();
      expect(DownloadService.resume).not.toHaveBeenCalled();
      expect(DownloadService.erase).toHaveBeenCalledWith({ id: 42 });
    });
  });

  describe('openMenu()', () => {
    it('should pause, send tab message, and call callback with folder response', async () => {
      const tabResponse = { folder: '/downloads', message: undefined, aborted: false, resume: false };
      vi.mocked(sendActiveTabMessage).mockReturnValue(of(tabResponse) as any);

      const callback = vi.fn();

      await firstValueFrom(InterceptService.openMenu(mockDownload, { erase: true }, callback));

      expect(DownloadService.pause).toHaveBeenCalledWith(42);
      expect(sendActiveTabMessage).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith({ filename: './downloads/file.zip' });
      expect(DownloadService.erase).toHaveBeenCalledWith({ id: 42 });
    });

    it('should resume when response.resume is true', async () => {
      const tabResponse = { folder: undefined, message: undefined, aborted: false, resume: true };
      vi.mocked(sendActiveTabMessage).mockReturnValue(of(tabResponse) as any);

      const callback = vi.fn();

      await firstValueFrom(InterceptService.openMenu(mockDownload, { erase: true }, callback));

      expect(DownloadService.resume).toHaveBeenCalledWith(42);
      expect(DownloadService.erase).not.toHaveBeenCalled();
    });

    it('should resume on abort when resume option is true', async () => {
      const tabResponse = { folder: undefined, message: undefined, aborted: true, resume: false };
      vi.mocked(sendActiveTabMessage).mockReturnValue(of(tabResponse) as any);

      const callback = vi.fn();

      await firstValueFrom(InterceptService.openMenu(mockDownload, { resume: true }, callback));

      expect(DownloadService.resume).toHaveBeenCalledWith(42);
    });

    it('should resume on error when resume=true', async () => {
      vi.mocked(sendActiveTabMessage).mockReturnValue(throwError(() => new Error('tab error')) as any);
      const callback = vi.fn();

      await expect(
        firstValueFrom(InterceptService.openMenu(mockDownload, { resume: true }, callback)),
      ).rejects.toThrow('tab error');

      expect(callback).toHaveBeenCalledWith();
      expect(DownloadService.resume).toHaveBeenCalledWith(42);
    });

    it('should erase on error when resume=false and erase=true', async () => {
      vi.mocked(sendActiveTabMessage).mockReturnValue(throwError(() => new Error('tab error')) as any);
      const callback = vi.fn();

      await expect(
        firstValueFrom(InterceptService.openMenu(mockDownload, { erase: true, resume: false }, callback)),
      ).rejects.toThrow('tab error');

      expect(callback).toHaveBeenCalledWith();
      expect(DownloadService.erase).toHaveBeenCalledWith({ id: 42 });
      expect(DownloadService.resume).not.toHaveBeenCalled();
    });

    it('should call callback with undefined when no folder in response', async () => {
      const tabResponse = { folder: undefined, message: undefined, aborted: false, resume: false };
      vi.mocked(sendActiveTabMessage).mockReturnValue(of(tabResponse) as any);

      const callback = vi.fn();

      await firstValueFrom(InterceptService.openMenu(mockDownload, { erase: true }, callback));

      expect(callback).toHaveBeenCalledWith(undefined);
    });
  });
});
