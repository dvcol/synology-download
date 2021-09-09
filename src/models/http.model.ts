/** Allowed HTTP methods */
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

/** Base Http request interface*/
export interface BaseHttpRequest {
    url: string;
    method?: Method;
    headers?: HttpHeaders,
    body?: Body
}