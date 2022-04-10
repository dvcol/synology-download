/** Allowed HTTP methods */
import type { URLSearchParams } from 'url';

export enum HttpMethod {
  post = 'post',
  POST = 'POST',
  get = 'get',
  GET = 'GET',
  put = 'put',
  PUT = 'PUT',
  delete = 'delete',
  DELETE = 'DELETE',
}

/** Union of HTTP methods types */
export type HttpMethods = keyof typeof HttpMethod;

/** Allowed Body types */
export type Body = string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null | undefined;

/** Allowed Http Headers */
export type HttpHeaders = Headers | string[][] | Record<string, string> | undefined;

export type HttpParameters = { [key: string]: string | string[] };

/** Base Http request interface */
export interface BaseHttpRequest {
  url: string | URL | { path: string | URL; base: string | URL };
  method?: HttpMethod;
  headers?: HttpHeaders;
  params?: HttpParameters;
  body?: Body;
  redirect?: RequestRedirect;
}

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
