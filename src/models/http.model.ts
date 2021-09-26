/** Allowed HTTP methods */
import {URLSearchParams} from "url";

export enum Method {post = "post", POST = "POST", get = "get", GET = "GET", put = "put", PUT = "PUT", delete = "delete", DELETE = "DELETE"}

/** Union of HTTP methods types */
export type Methods = keyof typeof Method;

/** Allowed Body types */
export type Body =
    string
    | Blob
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | URLSearchParams
    | ReadableStream<Uint8Array>
    | null
    | undefined;

/** Allowed Http Headers */
export type HttpHeaders = Headers | string[][] | Record<string, string> | undefined;

export type HttpParameters = { [key: string]: string | string[] }

/** Base Http request interface*/
export interface BaseHttpRequest {
    url: string | URL;
    method?: Method;
    headers?: HttpHeaders,
    params?: HttpParameters,
    body?: Body
}

export interface BaseHttpResponse<T> {
    success: boolean;
    data: T;
}

export interface SuccessHttpResponse<T> extends BaseHttpResponse<T> {
    success: true;
}

export interface FailureHttpResponse<T> extends BaseHttpResponse<T> {
    success: false;
    error: {
        code: number;
        errors?: any[];
    };
}

export type HttpResponse<T> = SuccessHttpResponse<T> | FailureHttpResponse<T>;
