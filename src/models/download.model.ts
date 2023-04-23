import { ColorLevel } from '@src/models/material-ui.model';

import type { DownloadItem, DownloadQuery } from '@src/utils';
import { computeProgress, elapsedTime, formatTime } from '@src/utils';

import { ContentSource } from './content.model';

import type { Content } from './content.model';
import type { TabCount } from './tab.model';

export interface Download extends DownloadItem, Omit<Content, 'id'> {
  status: DownloadStatus;
}

/**
 * Enumeration for possible task status
 */
export enum DownloadStatus {
  downloading = 'downloading_in_progress',
  paused = 'paused_in_progress',
  error = 'error_interrupted',
  cancelled = 'cancelled_interrupted',
  complete = 'finished_complete',
  deleted = 'finished_deleted',
}
export interface DownloadCount {
  badge: number;
  total: number;
  tabs: TabCount;
}

export type DownloadQueryArgs = Array<DownloadQuery | number[] | number | undefined>;

export interface DownloadQueryPayload {
  id: string;
  method:
    | 'search'
    | 'searchAll'
    | 'pause'
    | 'pauseAll'
    | 'getFileIcon'
    | 'resume'
    | 'resumeAll'
    | 'cancel'
    | 'cancelAll'
    | 'download'
    | 'open'
    | 'show'
    | 'erase'
    | 'eraseAll';
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
    case DownloadStatus.deleted:
      return ColorLevel.secondary;
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

const getEstimatedSpeed = (download: DownloadItem): number | undefined => {
  if (!download.estimatedEndTime) return;
  if (download.bytesReceived > download.fileSize) return;
  const date = new Date(download.estimatedEndTime);
  const seconds = elapsedTime(date);
  const remaining = download.fileSize - download.bytesReceived;
  return remaining / seconds;
};

const formatEstimatedTime = (download: DownloadItem) => {
  if (!download.estimatedEndTime) return;
  const date = new Date(download.estimatedEndTime);
  const seconds = elapsedTime(date);
  return formatTime(seconds);
};

const mapToDownloadStatus = (download: DownloadItem): DownloadStatus => {
  switch (download.state) {
    case 'in_progress':
      if (download.paused) return DownloadStatus.paused;
      return DownloadStatus.downloading;
    case 'interrupted':
      if (download.error === 'USER_CANCELED') return DownloadStatus.cancelled;
      return DownloadStatus.error;
    case 'complete':
      if (download.exists) return DownloadStatus.complete;
      return DownloadStatus.deleted;
    default:
      return DownloadStatus.error;
  }
};

export const mapToDownload = (item: DownloadItem): Download => {
  const path = item.filename?.split('/');
  return {
    ...item,
    source: ContentSource.Download,
    key: `${ContentSource.Download}-${item.id}`,
    status: mapToDownloadStatus(item),
    title: path?.pop() || item.filename || item.url || 'unkown',
    folder: path?.join('/'),
    progress: computeProgress(item.bytesReceived, item.fileSize),
    eta: formatEstimatedTime(item),
    speed: getEstimatedSpeed(item),
    size: item.fileSize,
    received: item.bytesReceived,
    createdAt: item.startTime ? new Date(item.startTime).getTime() : undefined,
    finishedAt: item.endTime ? new Date(item.endTime).getTime() : undefined,
  };
};
