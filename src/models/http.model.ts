export interface BaseHttpResponse<T> {
  success: boolean;
  data: T;
}

export interface SuccessHttpResponse<T> extends BaseHttpResponse<T> {
  success: true;
}

export interface HttpError {
  code: number;
  errors?: any[];
}

export interface FailureHttpResponse<T> extends BaseHttpResponse<T> {
  success: false;
  error: HttpError;
}

export type HttpResponse<T> = SuccessHttpResponse<T> | FailureHttpResponse<T>;

export enum CustomHeader {
  SynologyDownloadApp = 'synology-download-app',
}
