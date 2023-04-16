import type { Content, DownloadStationStatistic, TabCount, TaskPriority } from '@src/models';
import { ColorLevel, ContentSource } from '@src/models';
import { computeProgress, formatTime } from '@src/utils';

export interface TaskList {
  total: number;
  offset: number;
  tasks: Task[];
}

/**
 * Task object for Synology Download Station
 */
export interface Task extends Content {
  id: string;
  type: TaskType;
  username: string;
  title: string;
  /** Task size in bytes */
  size: number;
  status: TaskStatus;
  status_extra: TaskStatusExtra;
  additional: TaskAdditional;
  stopping?: boolean;
}

export interface TaskComplete {
  id: string;
  taskId: string;
}

/**
 * Possible protocol type
 */
export enum TaskType {
  bt = 'bt',
  nzb = 'nzb',
  http = 'http',
  https = 'https',
  ftp = 'ftp',
  eMule = 'eMule',
}

/**
 * Enumeration for possible task status
 */
export enum TaskStatus {
  downloading = 'downloading',
  paused = 'paused',
  error = 'error',
  seeding = 'seeding',
  waiting = 'waiting',
  extracting = 'extracting',
  finishing = 'finishing',
  finished = 'finished',
  hash_checking = 'hash_checking',
  filehosting_waiting = 'filehosting_waiting',
}

/**
 * Status_Extra object which provides extra information about task status.
 */
export interface TaskStatusExtra {
  /** for more details
   * see: https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
   */
  error_detail: string;
  /** Available when status=extracting, ranging from 0 to 100 */
  unzip_progress: number;
}

export interface TaskAdditional {
  detail: TaskDetail;
  transfer: TaskTransfer;
  file: TaskFile[];
  tracker: TaskTracker;
  peer: TaskPeer;
}

export enum TaskListOption {
  detail = 'detail',
  transfer = 'transfer',
  file = 'file',
  tracker = 'tracker',
  peer = 'peer',
}

export interface TaskDetail {
  destination: string;
  /** Task uri: HTTP/FTP/BT/Magnet/ED2K links */
  uri: string;
  unzip_password: string;
  create_time: number;
  completed_time: number;
  priority: TaskPriority;
  total_peers: number;
  total_pieces: number;
  connected_seeders: number;
  connected_leechers: number;
  seedelapsed: number;
}

export interface TaskTransfer {
  downloaded_pieces: number;
  /** Task downloaded size in bytes */
  size_downloaded: string;
  /** Task uploaded size in bytes */
  size_uploaded: string;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
}

export interface TaskFile {
  index: number;
  /** File name for Task v2 */
  name?: string;
  /** File name for Task v1 */
  filename?: string;
  priority: TaskPriority | 'skip';
  /** File size in bytes */
  size: string;
  /** Task download speed: byte/s */
  size_downloaded: string;
  wanted: boolean;
}

export interface TaskTracker {
  url: string;
  status: string;
  update_timer: number;
  seeds: number;
  peers: number;
}

export interface TaskPeer {
  address: string;
  /** Peer client name */
  agent: string;
  progress: number;
  /** Task download speed: byte/s */
  speed_download: number;
  /** Task upload speed: byte/s */
  speed_upload: number;
}

/**
 * Mapping function between task status and color level
 * @param _task the task to map
 */
export const taskStatusToColor = (_task: Task) => {
  if (_task.stopping) return ColorLevel.error;
  switch (_task.status) {
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

const computeEta = (task: Task): string | undefined => {
  const downloaded = Number(task.additional?.transfer?.size_downloaded);
  const speed = Number(task.additional?.transfer?.speed_download);
  if (downloaded && Number.isFinite(downloaded) && speed && Number.isFinite(speed)) {
    const secondsRemaining = Math.round((task.size - downloaded) / speed);
    return Number.isFinite(secondsRemaining) ? formatTime(secondsRemaining) : undefined;
  }
  return undefined;
};

export interface TaskForm {
  uri?: string;
  source?: string; // Custom Task
  destination?: { custom?: boolean; path?: string };
  username?: string;
  password?: string;
  extract_password?: string; // unzip password
  torrent?: string;
  create_list?: boolean;
}

export interface TaskCount {
  badge: number;
  total: number;
  tabs: TabCount;
}

export type TaskStatistics = DownloadStationStatistic;

export const mapToTask = (task: Task, stoppingIds: TaskComplete['taskId'][] = []): Task => {
  const folder = task.additional?.detail?.destination ?? undefined;
  const received = task.additional?.transfer?.size_downloaded ?? 0;
  const speed = task.additional?.transfer?.speed_download ?? undefined;
  const created = task.additional?.detail?.create_time ?? 0;
  const finished = task.additional?.detail?.completed_time ?? 0;
  return {
    ...task,
    source: ContentSource.Task,
    key: `${ContentSource.Task}-${task.id}`,
    folder,
    progress: computeProgress(received, task.size),
    speed,
    received: Number(received ?? 0),
    eta: computeEta(task),
    createdAt: created ? new Date(created * 1000).getTime() : undefined,
    finishedAt: finished ? new Date(finished * 1000).getTime() : undefined,
    stopping: stoppingIds?.includes(task.id),
  };
};
