import type { HttpMethod, HttpParameters } from '@dvcol/web-extension-utils';

import type { TaskType } from '@src/models/task.model';

import type { ApiInfo } from './api-info.model';

export enum SessionName {
  DownloadStation = 'DownloadStation',
  FileStation = 'FileStation',
}

export enum Controller {
  Common = 'webapi',
  DownloadStation = 'webapi/DownloadStation',
}

export enum Endpoint {
  Info = 'info.cgi',
  Auth = 'auth.cgi',
  Query = 'query.cgi',
  Task = 'task.cgi',
  Entry = 'entry.cgi',
  Statistic = 'statistic.cgi',
}

export enum CommonAPI {
  Info = 'SYNO.API.Info',
  Auth = 'SYNO.API.Auth',
}

export enum DownloadStationAPI {
  Schedule = 'SYNO.DownloadStation.Schedule',
  Task = 'SYNO.DownloadStation.Task',
  Info = 'SYNO.DownloadStation.Info',
  Statistic = 'SYNO.DownloadStation.Statistic',
  RssSite = 'SYNO.DownloadStation.RSS.Site',
  RssFeed = 'SYNO.DownloadStation.RSS.Feed',
}

export enum DownloadStation2API {
  Task = 'SYNO.DownloadStation2.Task',
  TaskList = 'SYNO.DownloadStation2.Task.List',
  TaskListPolling = 'SYNO.DownloadStation2.Task.List.Polling',
  TaskBt = 'SYNO.DownloadStation2.Task.BT',
  TaskBtFile = 'SYNO.DownloadStation2.Task.BT.File',
  TaskComplete = 'SYNO.DownloadStation2.Task.Complete',
}

export enum FileStationAPI {
  Info = 'SYNO.FileStation.Info',
  List = 'SYNO.FileStation.List',
  Search = 'SYNO.FileStation.Search',
  VirtualFolder = 'SYNO.FileStation.VirtualFolder',
  Favorite = 'SYNO.FileStation.Favorite',
  Thumb = 'SYNO.FileStation.Thumb',
  DirSize = 'SYNO.FileStation.DirSize',
  MD5 = 'SYNO.FileStation.MD5',
  Permission = 'SYNO.FileStation.CheckPermission',
  Upload = 'SYNO.FileStation.Upload',
  Download = 'SYNO.FileStation.Download',
  Sharing = 'SYNO.FileStation.Sharing',
  CreateFolder = 'SYNO.FileStation.CreateFolder',
  Rename = 'SYNO.FileStation.Rename',
  CopyMove = 'SYNO.FileStation.CopyMove',
  Delete = 'SYNO.FileStation.Delete',
  Extract = 'SYNO.FileStation.Extract',
  Compress = 'SYNO.FileStation.Compress',
  BackgroundTask = 'SYNO.FileStation.BackgroundTask',
}

export type Api = CommonAPI | DownloadStationAPI | DownloadStation2API | FileStationAPI;

export enum InfoMethod {
  query = 'query',
}

export enum AuthMethod {
  login = 'login',
  logout = 'logout',
}

export enum TaskMethod {
  list = 'list',
  create = 'create',
  delete = 'delete',
  pause = 'pause',
  resume = 'resume',
  edit = 'edit',
  getInfo = 'getinfo',
  getConfig = 'getconfig',
  setConfig = 'setserverconfig',
}

export enum TaskCreateMethod {
  get = 'get',
  create = 'create',
  download = 'download',
}

export enum TaskCompleteMethod {
  start = 'start',
  status = 'status',
  stop = 'stop',
}
export enum TaskBtMethod {
  get = 'get',
  set = 'set',
}

export enum TaskBtFileMethod {
  set = 'set',
  list = 'list',
  copy = 'copy',
}

export enum FileMethod {
  list = 'list',
  listShare = 'list_share',
  create = 'create',
  rename = 'rename',
}

export type SynologyMethod = InfoMethod | AuthMethod | TaskMethod | FileMethod;

export const CommonErrorCode = {
  100: 'Unknown error',
  101: 'Invalid parameter',
  102: 'The requested API does not exist',
  103: 'The requested method does not exist',
  104: 'The requested version does not support the functionality',
  105: 'The logged in session does not have permission',
  106: 'Session timeout',
  107: 'Session interrupted by duplicate login',
  108: 'Failed to upload the file.',
  109: 'The network connection is unstable or the system is busy.',
  110: 'The network connection is unstable or the system is busy.',
  111: 'The network connection is unstable or the system is busy.',
  112: 'Preserve for other purpose.',
  113: 'Preserve for other purpose.',
  114: 'Lost parameters for this API.',
  115: 'Not allowed to upload a file.',
  116: 'Not allowed to perform for a demo site.',
  117: 'The network connection is unstable or the system is busy.',
  118: 'The network connection is unstable or the system is busy.',
  119: 'Invalid session.',
  150: 'Request source IP does not match the login IP.',
};

export const AuthErrorCode = {
  400: 'No such account or incorrect password',
  401: 'Account disabled.',
  402: 'Permission denied.',
  403: '2-step verification code required.',
  404: 'Failed to authenticate 2-step verification code.',
  406: 'Enforce to authenticate with 2-factor authentication code.',
  407: 'Blocked IP source.',
  408: 'Expired password cannot change.',
  409: 'Expired password.',
  410: 'Password must be changed.',
};

export const TaskErrorCode = {
  400: 'File upload failed',
  401: 'Max number of tasks reached',
  402: 'Destination denied',
  403: 'Destination does not exist',
  404: 'Invalid task id',
  405: 'Invalid task action',
  406: 'No default destination',
  407: 'Set destination failed',
  408: 'File does not exist',
};

export const FileErrorCode = {
  400: 'Invalid parameter of file operation',
  401: 'Unknown error of file operation',
  402: 'System is too busy',
  403: 'Invalid user does this file operation',
  404: 'Invalid group does this file operation',
  405: 'Invalid user and group does this file operation',
  406: "Can't get user/group information from the account server",
  407: 'Operation not permitted',
  408: 'No such file or directory',
  409: 'Non-supported file system',
  410: 'Failed to connect internet-based file system (e.g., CIFS)',
  411: 'Read-only file system',
  412: 'Filename too long in the non-encrypted file system',
  413: 'Filename too long in the encrypted file system',
  414: 'File already exists',
  415: 'Disk quota exceeded',
  416: 'No space left on device',
  417: 'Input/output error',
  418: 'Illegal name or path',
  419: 'Illegal file name',
  420: 'Illegal file name on FAT file system',
  421: 'Device or resource busy',
  599: 'No such task of the file operation',
  1100: 'Failed to create a folder. More information in <errors> object.',
  1101: 'The number of folders to the parent folder would exceed the system limitation.',
  1200: 'Failed to rename it. More information in <errors> object',
};

export const ErrorMap: Record<string, Record<number, string>> = {
  [CommonAPI.Info]: CommonErrorCode,
  [CommonAPI.Auth]: { ...CommonErrorCode, ...AuthErrorCode },
  ...Object.values(DownloadStationAPI).reduce((codes, v) => ({ ...codes, [v]: { ...CommonErrorCode, ...TaskErrorCode } }), {}),
  ...Object.values(FileStationAPI).reduce((codes, v) => ({ ...codes, [v]: { ...CommonErrorCode, ...FileErrorCode } }), {}),
};

export interface InfoResponse {
  [key: string]: ApiInfo;
}

export interface LoginRequest {
  account: string;
  passwd: string;
  baseUrl?: string;
  otp_code?: string;
  enable_device_token?: 'yes' | 'no';
  device_name?: string;
  device_id?: string;
  format?: 'cookie' | 'sid';
}

export enum TaskPriority {
  low = 'low',
  normal = 'normal',
  high = 'high',
}

export interface TaskEditResponse {
  extract_password: string;
  is_active_torrent: boolean;

  priority: TaskPriority;

  destination: string;

  max_peers: number;
  max_download_rate: number;
  max_upload_rate: number;

  seeding_interval: number;
  seeding_ratio: number;
}

export interface TaskEditRequest {
  task_id: string;

  destination?: string;

  priority?: TaskPriority;

  max_peers?: number;
  max_download_rate?: number;
  max_upload_rate?: number;

  seeding_ratio?: number;
  seeding_interval?: number;

  'ext-comp-1522'?: string;
}

export interface TaskFileEditRequest {
  task_id: string;
  index: number[];
  wanted?: boolean;
  priority?: TaskPriority;
}

export interface TaskCompleteResponse {
  /** id fo the task end process (e.g. "dev/SYNODLTaskEnd640A245D84136759") */
  task_id: string;
}

export interface LoginResponse {
  sid: string;
  did?: string;
  device_id?: string;
  ik_message?: string;
  is_portal_port?: boolean;
  synotoken?: string;
}

export interface CommonResponse {
  error: number;
  id: string;
}

export enum TaskCreateType {
  file = 'file',
  url = 'url',
}

export interface TaskCreateRequest {
  type: TaskCreateType;
  /** to prompt task creation or not */
  create_list: boolean;
  destination?: string;
  username?: string;
  password?: string;
  unzip?: string;
  url?: string[];
  file?: string[];
  /** epoch timestamp */
  mtime?: number;
  size?: number;
}

export interface TaskCreateResponse {
  list_id: string[];
  task_id: string[];
}

export interface TaskListFile {
  index: number;
  name: string;
  size: number;
}

export interface TaskListResponse {
  size: number;
  title: string;
  type: TaskType;
  filed: TaskListFile[];
}

export interface TaskListDownloadRequest {
  list_id: string;
  selected: number[];
  destination?: string;
  create_subfolder?: boolean;
}

export interface TaskListDownloadResponse {
  /** id fo the task create process (e.g. "dev/SYNODLTaskListDownload640BB11B252329B4") */
  task_id: string;
}

export type SynologyQueryArgs = [
  method: HttpMethod,
  params: HttpParameters,
  version: string,
  api: Api,
  endpoint: Endpoint,
  base?: string,
  formData?: boolean,
];

export interface SynologyQueryPayload {
  id: string;
  args: SynologyQueryArgs;
}
