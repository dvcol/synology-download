import { ColorLevel } from '@src/models/material-ui.model';

import { formatBytes, formatTime, getDateDiff } from '@src/utils';

import type { TabCount } from './tab.model';

export type DownloadOptions = chrome.downloads.DownloadOptions;
export type DownloadQuery = chrome.downloads.DownloadQuery;
export type DownloadItem = chrome.downloads.DownloadItem;
export type DownloadState = chrome.downloads.DownloadState;

export interface Download extends DownloadItem {
  status: DownloadStatus;
}

/**
 * Enumeration for possible task status
 */
export enum DownloadStatus {
  downloading = 'downloading',
  paused = 'paused',
  error = 'error',
  cancelled = 'cancelled',
  complete = 'complete',
  unknown = 'unknown',
}
export interface DownloadCount {
  badge: number;
  total: number;
  tabs: TabCount;
}

export type DownloadQueryArgs = [any];

export interface DownloadQueryPayload {
  id: string;
  method: 'search' | 'pause' | 'getFileIcon' | 'resume' | 'cancel' | 'download' | 'open' | 'show' | 'erase';
  args: DownloadQueryArgs;
}

/**
 * Mapping function between download state and color level
 * @param state the state of the download to map
 */
export const downloadStatusToColor = (state: DownloadStatus) => {
  switch (state) {
    case DownloadStatus.downloading:
      return ColorLevel.info;
    case DownloadStatus.complete:
      return ColorLevel.success;
    case DownloadStatus.paused:
      return ColorLevel.warning;
    case DownloadStatus.cancelled:
      return ColorLevel.warning;
    case DownloadStatus.error:
      return ColorLevel.error;
    default:
      return ColorLevel.primary;
  }
};

export const getEstimatedSpeed = (download: Download) => {
  if (!download.estimatedEndTime) return;
  if (download.bytesReceived > download.fileSize) return;
  const date = new Date(download.estimatedEndTime);
  const seconds = getDateDiff(date);
  const remaining = download.fileSize - download.bytesReceived;
  const speed = remaining / seconds;
  return formatBytes(speed);
};

export const formatEstimatedTime = (download: Download) => {
  if (!download.estimatedEndTime) return;
  const date = new Date(download.estimatedEndTime);
  const seconds = getDateDiff(date);
  return formatTime(seconds);
};

export const mapToDownloadStatus = (download: DownloadItem): DownloadStatus => {
  switch (download.state) {
    case 'in_progress':
      if (download.paused) return DownloadStatus.paused;
      return DownloadStatus.downloading;
    case 'interrupted':
      if (download.error === 'USER_CANCELED') return DownloadStatus.cancelled;
      return DownloadStatus.error;
    case 'complete':
      return DownloadStatus.complete;
    default:
      return DownloadStatus.unknown;
  }
};

export const mapToDownload = (download: DownloadItem): Download => ({ ...download, status: mapToDownloadStatus(download) });
