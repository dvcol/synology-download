import { Task } from './task.model';
import { ApiInfo } from './api-info.model';

export enum SessionName {
  DiskStation = 'DiskStation',
}

export enum Controller {
  Common = 'webapi',
  DownloadStation = 'webapi/DownloadStation',
}

export enum API {
  Info = 'SYNO.API.Info',
  Auth = 'SYNO.API.Auth',

  DownloadStationSchedule = 'SYNO.DownloadStation.Schedule',
  DownloadStationTask = 'SYNO.DownloadStation.Task',
  DownloadStationStatistic = 'SYNO.DownloadStation.Statistic',
  DownloadStationRssSite = 'SYNO.DownloadStation.RSS.Site',
  DownloadStationRssFeed = 'SYNO.DownloadStation.RSS.Feed',

  FileStationInfo = 'SYNO.FileStation.Info',
  FileStationList = 'SYNO.FileStation.List',
  FileStationSearch = 'SYNO.FileStation.Search',
  FileStationVirtualFolder = 'SYNO.FileStation.VirtualFolder',
  FileStationFavorite = 'SYNO.FileStation.Favorite',
  FileStationThumb = 'SYNO.FileStation.Thumb',
  FileStationDirSize = 'SYNO.FileStation.DirSize',
  FileStationMD5 = 'SYNO.FileStation.MD5',
  FileStationCheckPermission = 'SYNO.FileStation.CheckPermission',
  FileStationUpload = 'SYNO.FileStation.Upload',
  FileStationDownload = 'SYNO.FileStation.Download',
  FileStationSharing = 'SYNO.FileStation.Sharing',
  FileStationCreateFolder = 'SYNO.FileStation.CreateFolder',
  FileStationRename = 'SYNO.FileStation.Rename',
  FileStationCopyMove = 'SYNO.FileStation.CopyMove',
  FileStationDelete = 'SYNO.FileStation.Delete',
  FileStationExtract = 'SYNO.FileStation.Extract',
  FileStationCompress = 'SYNO.FileStation.Compress',
  FileStationBackgroundTask = 'SYNO.FileStation.BackgroundTask',
}

export enum Endpoint {
  Info = 'info.cgi',
  Query = 'query.cgi',
  Auth = 'auth.cgi',
  Task = 'task.cgi',
  Entry = 'entry.cgi',
}

export enum SynologyMethod {
  query = 'query',
  login = 'login',
  logout = 'logout',
  list = 'list',
  create = 'create',
  delete = 'delete',
  pause = 'pause',
  resume = 'resume',
  edit = 'edit',
}

export enum ErrorCode {
  Common_error_100 = 'Unknown error',
  Common_error_101 = 'Invalid parameter',
  Common_error_102 = 'The requested API does not exist',
  Common_error_103 = 'The requested method does not exist',
  Common_error_104 = 'The requested version does not support the functionality',
  Common_error_105 = 'The logged in session does not have permission',
  Common_error_106 = 'Session timeout',
  Common_error_107 = 'Session interrupted by duplicate login',
  Common_error_119 = 'SID not found',

  Auth_Error_400 = 'No such account or incorrect password',
  Auth_Error_401 = 'Account disabled',
  Auth_Error_402 = 'Permission denied',
  Auth_Error_403 = '2-step verification code required',
  Auth_Error_404 = 'Failed to authenticate 2-step verification code',

  Task_Error_400 = 'File upload failed',
  Task_Error_401 = 'Max number of tasks reached',
  Task_Error_402 = 'Destination denied',
  Task_Error_403 = 'Destination does not exist',
  Task_Error_404 = 'Invalid task id',
  Task_Error_405 = 'Invalid task action',
  Task_Error_406 = 'No default destination',
  Task_Error_407 = 'Set destination failed',
  Task_Error_408 = 'File does not exist',

  File_Error_400 = 'Invalid parameter of file operation',
  File_Error_401 = 'Unknown error of file operation',
  File_Error_402 = 'System is too busy',
  File_Error_403 = 'Invalid user does this file operation',
  File_Error_404 = 'Invalid group does this file operation',
  File_Error_405 = 'Invalid user and group does this file operation',
  File_Error_406 = "Can't get user/group information from the account server",
  File_Error_407 = 'Operation not permitted',
  File_Error_408 = 'No such file or directory',
  File_Error_409 = 'Non-supported file system',
  File_Error_410 = 'Failed to connect internet-based file system (e.g., CIFS)',
  File_Error_411 = 'Read-only file system',
  File_Error_412 = 'Filename too long in the non-encrypted file system',
  File_Error_413 = 'Filename too long in the encrypted file system',
  File_Error_414 = 'File already exists',
  File_Error_415 = 'Disk quota exceeded',
  File_Error_416 = 'No space left on device',
  File_Error_417 = 'Input/output error',
  File_Error_418 = 'Illegal name or path',
  File_Error_419 = 'Illegal file name',
  File_Error_420 = 'Illegal file name on FAT file system',
  File_Error_421 = 'Device or resource busy',
  File_Error_599 = 'No such task of the file operation',
}

export interface InfoResponse {
  [key: string]: ApiInfo;
}

export interface LoginResponse {
  sid: string;
}

export interface ListResponse {
  total: number;
  offset: number;
  tasks: Task[];
}

export interface CommonResponse {
  error: number;
  id: string;
}
