import {Task} from "./task.model";

export enum SessionName {
    DownloadStation = "DownloadStation",
    FileStation = "FileStation"
}

export enum API {
    Auth = "SYNO.API.Auth",
    DownloadStation = 'SYNO.DownloadStation.Task'
}

export enum Endpoint {
    Auth = 'auth.cgi',
    DonwloadStation = 'DownloadStation/task.cgi'
}

export enum Method {
    login = 'login',
    logout = 'logout',
    list = 'list'
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
    Auth_Error_404 = 'Failed to authenticate 2-step verification code'
}

export interface LoginSuccess {
    sid: string
}

export interface ListSuccess {
    total: number,
    offset: number,
    tasks: Task[]
}
