import type { DownloadItem } from '@dvcol/web-extension-utils';

import { ContentSource } from './content.model';
import { DownloadStatus, downloadStatusToColor, mapToDownload } from './download.model';
import { ColorLevel } from './material-ui.model';

describe('download.model', () => {
  describe('downloadStatusToColor', () => {
    it('should return info for downloading', () => {
      expect(downloadStatusToColor(DownloadStatus.downloading)).toBe(ColorLevel.info);
    });

    it('should return success for complete', () => {
      expect(downloadStatusToColor(DownloadStatus.complete)).toBe(ColorLevel.success);
    });

    it('should return secondary for deleted', () => {
      expect(downloadStatusToColor(DownloadStatus.deleted)).toBe(ColorLevel.secondary);
    });

    it('should return warning for paused', () => {
      expect(downloadStatusToColor(DownloadStatus.paused)).toBe(ColorLevel.warning);
    });

    it('should return warning for cancelled', () => {
      expect(downloadStatusToColor(DownloadStatus.cancelled)).toBe(ColorLevel.warning);
    });

    it('should return error for error', () => {
      expect(downloadStatusToColor(DownloadStatus.error)).toBe(ColorLevel.error);
    });
  });

  describe('mapToDownload', () => {
    const baseItem: DownloadItem = {
      id: 1,
      url: 'http://example.com/file.zip',
      filename: '/home/user/Downloads/file.zip',
      state: 'in_progress',
      paused: false,
      bytesReceived: 50000,
      fileSize: 100000,
      exists: true,
      startTime: '2024-01-01T00:00:00Z',
      endTime: '',
      estimatedEndTime: undefined,
      error: undefined,
    } as DownloadItem;

    it('should set source to Download', () => {
      const result = mapToDownload(baseItem);
      expect(result.source).toBe(ContentSource.Download);
    });

    it('should set key with source prefix', () => {
      const result = mapToDownload(baseItem);
      expect(result.key).toBe(`${ContentSource.Download}-${baseItem.id}`);
    });

    it('should extract title from filename', () => {
      const result = mapToDownload(baseItem);
      expect(result.title).toBe('file.zip');
    });

    it('should extract folder from filename', () => {
      const result = mapToDownload(baseItem);
      expect(result.folder).toBe('/home/user/Downloads');
    });

    it('should compute progress', () => {
      const result = mapToDownload(baseItem);
      expect(result.progress).toBe(50);
    });

    it('should set size from fileSize', () => {
      const result = mapToDownload(baseItem);
      expect(result.size).toBe(100000);
    });

    it('should set received from bytesReceived', () => {
      const result = mapToDownload(baseItem);
      expect(result.received).toBe(50000);
    });

    it('should map in_progress to downloading status', () => {
      const result = mapToDownload(baseItem);
      expect(result.status).toBe(DownloadStatus.downloading);
    });

    it('should map paused in_progress to paused status', () => {
      const result = mapToDownload({ ...baseItem, paused: true });
      expect(result.status).toBe(DownloadStatus.paused);
    });

    it('should map complete to complete status', () => {
      const result = mapToDownload({ ...baseItem, state: 'complete', exists: true });
      expect(result.status).toBe(DownloadStatus.complete);
    });

    it('should map complete with !exists to deleted status', () => {
      const result = mapToDownload({ ...baseItem, state: 'complete', exists: false });
      expect(result.status).toBe(DownloadStatus.deleted);
    });

    it('should map interrupted USER_CANCELED to cancelled status', () => {
      const result = mapToDownload({ ...baseItem, state: 'interrupted', error: 'USER_CANCELED' });
      expect(result.status).toBe(DownloadStatus.cancelled);
    });

    it('should map interrupted (other) to error status', () => {
      const result = mapToDownload({ ...baseItem, state: 'interrupted', error: 'NETWORK_FAILED' });
      expect(result.status).toBe(DownloadStatus.error);
    });

    it('should set createdAt from startTime', () => {
      const result = mapToDownload(baseItem);
      expect(result.createdAt).toBe(new Date('2024-01-01T00:00:00Z').getTime());
    });
  });
});
