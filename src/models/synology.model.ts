import { Task } from './task.model';

export enum SessionName {
  DownloadStation = 'DownloadStation',
  FileStation = 'FileStation',
}

export enum API {
  Auth = 'SYNO.API.Auth',
  DownloadStation = 'SYNO.DownloadStation.Task',
}

export enum Endpoint {
  Auth = 'auth.cgi',
  DonwloadStation = 'DownloadStation/task.cgi',
}

export enum SynologyMethod {
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
