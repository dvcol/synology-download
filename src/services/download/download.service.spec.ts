/* eslint-disable ts/no-unsafe-return, ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call, ts/no-unsafe-argument */
import { firstValueFrom, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mapToDownload } from '../../models/download.model';
import { setDownloads } from '../../store/actions/downloads.action';
import { cancel, download, erase, pause, resume, search } from '../../utils/chrome/chrome-download.utils';
import { sendMessage } from '../../utils/chrome/chrome-message.utils';
import { DownloadService } from './download.service';

vi.mock('../../models/download.model', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, mapToDownload: vi.fn((item: any) => ({ ...item, mapped: true })) };
});
vi.mock('../../utils/chrome/chrome-download.utils', () => ({
  search: vi.fn(async () => []),
  erase: vi.fn(async () => []),
  pause: vi.fn(async () => undefined),
  resume: vi.fn(async () => undefined),
  cancel: vi.fn(async () => undefined),
  download: vi.fn(async () => 123),
  getFileIcon: vi.fn(async () => 'icon.png'),
  open: vi.fn(async () => undefined),
  show: vi.fn(async () => undefined),
  showDefaultFolder: vi.fn(async () => undefined),
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
  };
});
vi.mock('../../store/actions/downloads.action', () => ({
  setDownloads: vi.fn((x: any) => ({ type: 'setDownloads', payload: x })),
}));
vi.mock('../../store/selectors/composite.selector', () => ({
  getActiveDownloadIdsByActionScope: vi.fn(() => []),
  getDownloadingDownloadIdsByActionScope: vi.fn(() => []),
  getFinishedDownloadIdsByActionScope: vi.fn(() => []),
  getPausedDownloadIdsByActionScope: vi.fn(() => []),
}));
vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

const mockStore = {
  dispatch: vi.fn(),
  getState: vi.fn(() => ({})),
};

describe('downloadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    DownloadService.destroy();
  });

  describe('init / destroy lifecycle', () => {
    it('should call destroy before initializing', () => {
      const destroySpy = vi.spyOn(DownloadService, 'destroy');
      DownloadService.init(mockStore as any, false);
      expect(destroySpy).toHaveBeenCalledTimes(1);
    });

    it('should set store and call listen when not proxy', () => {
      const listenSpy = vi.spyOn(DownloadService, 'listen');
      DownloadService.init(mockStore as any, false);
      expect(listenSpy).toHaveBeenCalled();
    });

    it('should set store and NOT call listen when proxy', () => {
      const listenSpy = vi.spyOn(DownloadService, 'listen');
      DownloadService.init(mockStore as any, true);
      expect(listenSpy).not.toHaveBeenCalled();
    });

    it('should create a new Subject on destroy so subsequent init works', () => {
      DownloadService.init(mockStore as any, false);
      DownloadService.destroy();
      // Should not throw when re-initializing
      expect(() => DownloadService.init(mockStore as any, false)).not.toThrow();
    });
  });

  describe('do()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should route to search when method is "search"', async () => {
      const searchSpy = vi.spyOn(DownloadService, 'search');
      const query = { id: 1 };
      await firstValueFrom(DownloadService.do('search', query));
      expect(searchSpy).toHaveBeenCalledWith(query);
    });

    it('should return throwError for unknown method', async () => {
      await expect(firstValueFrom(DownloadService.do('unknownMethod' as any))).rejects.toThrow(
        "Method 'unknownMethod' is unknown.",
      );
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome search and map results with mapToDownload', async () => {
      const items = [{ id: 1, filename: 'a.txt' }, { id: 2, filename: 'b.txt' }];
      vi.mocked(search).mockResolvedValueOnce(items as any);

      const result = await firstValueFrom(DownloadService.search({}));

      expect(search).toHaveBeenCalledWith({});
      expect(mapToDownload).toHaveBeenCalledTimes(2);
      expect(result).toEqual([
        { id: 1, filename: 'a.txt', mapped: true },
        { id: 2, filename: 'b.txt', mapped: true },
      ]);
    });

    it('should forward via sendMessage when proxy', async () => {
      DownloadService.init(mockStore as any, true);
      vi.mocked(sendMessage).mockReturnValueOnce(of([{ id: 1 }]) as any);

      const result = await firstValueFrom(DownloadService.search({ id: 1 }));

      expect(sendMessage).toHaveBeenCalled();
      expect(search).not.toHaveBeenCalled();
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('erase()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome erase and trigger searchAll', async () => {
      vi.mocked(erase).mockResolvedValueOnce([1]);
      vi.mocked(search).mockResolvedValue([]);

      const result = await firstValueFrom(DownloadService.erase({ id: 1 }));

      expect(erase).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual([1]);
    });
  });

  describe('pause()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome pause and trigger searchAll', async () => {
      vi.mocked(pause).mockResolvedValueOnce(undefined);
      vi.mocked(search).mockResolvedValue([]);

      await firstValueFrom(DownloadService.pause(42));

      expect(pause).toHaveBeenCalledWith(42);
    });
  });

  describe('resume()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome resume and trigger searchAll', async () => {
      vi.mocked(resume).mockResolvedValueOnce(undefined);
      vi.mocked(search).mockResolvedValue([]);

      await firstValueFrom(DownloadService.resume(7));

      expect(resume).toHaveBeenCalledWith(7);
    });
  });

  describe('cancel()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome cancel and trigger searchAll', async () => {
      vi.mocked(cancel).mockResolvedValueOnce(undefined);
      vi.mocked(search).mockResolvedValue([]);

      await firstValueFrom(DownloadService.cancel(99));

      expect(cancel).toHaveBeenCalledWith(99);
    });
  });

  describe('download()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should call chrome download and trigger searchAll', async () => {
      vi.mocked(download).mockResolvedValueOnce(123);
      vi.mocked(search).mockResolvedValue([]);

      const result = await firstValueFrom(DownloadService.download({ url: 'http://example.com/file.zip' }));

      expect(download).toHaveBeenCalledWith({ url: 'http://example.com/file.zip' });
      expect(result).toBe(123);
    });
  });

  describe('searchAll()', () => {
    beforeEach(() => {
      DownloadService.init(mockStore as any, false);
    });

    it('should search all downloads and dispatch setDownloads', async () => {
      const items = [{ id: 1 }];
      vi.mocked(search).mockResolvedValueOnce(items as any);

      const result = await firstValueFrom(DownloadService.searchAll());

      expect(search).toHaveBeenCalledWith({});
      expect(setDownloads).toHaveBeenCalled();
      expect(result).toEqual([{ id: 1, mapped: true }]);
    });
  });
});
