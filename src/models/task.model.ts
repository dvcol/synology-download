import { ColorLevel } from './material-ui.model';
import prettyBytes from 'pretty-bytes';

/**
 * Task object for Synology Download Station
 */
export interface Task {
  id: string;
  type: TaskType;
  username: string;
  title: string;
  /**
   * Task size in bytes
   */
  size: number;
  status: TaskStatus;
  status_extra: StatusExtra;
  additional: Additional;
}

/**
 * Possible protocol type
 */
export enum TaskType {
  bt = 'bt',
  nzb = 'nzb',
  http = 'http',
  ftp = 'ftp',
  eMule = 'eMule',
}

/**
 * Enumeration for possible task status
 */
export enum TaskStatus {
  waiting = 'waiting',
  downloading = 'downloading',
  paused = 'paused',
  finishing = 'finishing',
  finished = 'finished',
  hash_checking = 'hash_checking',
  seeding = 'seeding',
  filehosting_waiting = 'filehosting_waiting',
  extracting = 'extracting',
  error = 'error',
}

/**
 * Status_Extra object which provides extra information about task status.
 */
export interface StatusExtra {
  /** for more details
   * see: https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
   */
  error_detail: string;
  /** Available when status=extracting, ranging from 0 to 100 */
  unzip_progress: number;
}

export interface Additional {
  detail: Detail;
  transfer: Transfer;
  file: File[];
  tracker: Tracker;
  peer: Peer;
}

export interface Detail {
  destination: string;
  /** Task uri: HTTP/FTP/BT/Magnet/ED2K links */
  uri: string;
  create_time: Date;
  priority: 'auto' | 'low' | 'normal' | 'high';
  total_peers: number;
  connected_seeders: number;
  connected_leechers: number;
}

export interface Transfer {
  /** Task downloaded size in bytes */
  size_downloaded: string;
  /** Task uploaded size in bytes */
  size_uploaded: string;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
}

export interface File {
  filename: string;
  /** File size in bytes */
  size: string;
  /** Task download speed: byte/s */
  size_downloaded: string;
  priority: 'skip' | 'low' | 'normal' | 'high';
}

export interface Tracker {
  url: string;
  status: string;
  update_timer: number;
  seeds: number;
  peers: number;
}

export interface Peer {
  address: string;
  /** Peer client name */
  agent: string;
  progress: number;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
}

export enum TaskListOption {
  detail = 'detail',
  transfer = 'transfer',
  file = 'file',
  tracker = 'tracker',
  peer = 'peer',
}

/**
 * Mapping function between task status and color level
 * @param status the TabType to map
 */
export const taskStatusToColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.downloading:
      return ColorLevel.info;
    case TaskStatus.seeding:
      return ColorLevel.secondary;
    case TaskStatus.finished:
      return ColorLevel.success;
    case TaskStatus.paused:
      return ColorLevel.warning;
    case TaskStatus.error:
      return ColorLevel.error;
    default:
      return ColorLevel.primary;
  }
};

export const computeProgress = (downloaded: number | any, size: number | any): number => {
  const numDownloaded = Number(downloaded);
  const numSize = Number(size);
  if (numDownloaded && Number.isFinite(numDownloaded) && numSize && Number.isFinite(numSize)) {
    const progress = Math.floor((numDownloaded / numSize) * 100);
    return Number.isFinite(progress) ? progress : 0;
  }
  return 0;
};

export const computeEta = (task: Task): string | undefined => {
  const downloaded = Number(task.additional?.transfer?.size_downloaded);
  const speed = Number(task.additional?.transfer?.speed_download);
  if (downloaded && Number.isFinite(downloaded) && speed && Number.isFinite(speed)) {
    const secondsRemaining = Math.round((task.size - downloaded) / speed);
    return Number.isFinite(secondsRemaining) ? formatTime(secondsRemaining) : undefined;
  }
  return undefined;
};

export const formatTime = (s: number): string => {
  const hours = Math.floor(s / (60 * 60));
  const minutes = Math.floor(s / 60) - hours * 60;
  const seconds = Math.floor(s) - hours * 60 * 60 - minutes * 60;

  function withZero(n: number) {
    return n > 9 ? n.toString() : `0${n.toString()}`;
  }

  return `${hours ? hours + 'h ' : ''}${hours ? withZero(minutes) : minutes}m ${withZero(seconds)}s`;
};

export const formatBytes = (byte: number | any): string => {
  const num = Number(byte);
  if (num && Number.isFinite(num)) {
    return prettyBytes(num);
  }
  return '0 B';
};
