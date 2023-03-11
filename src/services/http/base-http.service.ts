import type { BaseHttpRequest, HttpBody, HttpHeaders, HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod, rxFetch } from '@dvcol/web-extension-utils';

import type { Observable } from 'rxjs';

/** Base Http request class implementation */
export class BaseHttpService {
  constructor(protected baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  request<T>(baseHttpRequest: BaseHttpRequest): Observable<T> {
    const { url } = baseHttpRequest;
    if (typeof url === 'string' || url instanceof URL) baseHttpRequest.url = `${this.baseUrl}/${url}`;
    return rxFetch<T>(baseHttpRequest);
  }

  get<T>(
    url: BaseHttpRequest['url'],
    params?: HttpParameters,
    headers?: HttpHeaders,
    request: Omit<BaseHttpRequest, 'url' | 'param'> = {},
  ): Observable<T> {
    const _request = {
      headers,
      ...request,
    };
    return this.request({ url, method: HttpMethod.GET, params, ..._request });
  }

  post<T>(
    url: BaseHttpRequest['url'],
    body: HttpBody,
    params?: HttpParameters,
    headers?: HttpHeaders,
    request: Omit<BaseHttpRequest, 'url' | 'param' | 'body'> = {},
  ): Observable<T> {
    const _request = {
      headers,
      ...request,
    };
    return this.request({
      url,
      method: HttpMethod.POST,
      params,
      body,
      ..._request,
    });
  }

  put<T>(
    url: BaseHttpRequest['url'],
    body: HttpBody,
    params?: HttpParameters,
    headers?: HttpHeaders,
    request: Omit<BaseHttpRequest, 'url' | 'param' | 'body'> = {},
  ): Observable<T> {
    const _request = {
      headers,
      ...request,
    };
    return this.request({ url, method: HttpMethod.PUT, params, body, ..._request });
  }

  delete<T>(
    url: BaseHttpRequest['url'],
    params?: HttpParameters,
    headers?: HttpHeaders,
    request: Omit<BaseHttpRequest, 'url' | 'param'> = {},
  ): Observable<T> {
    const _request = {
      headers,
      ...request,
    };
    return this.request({ url, method: HttpMethod.DELETE, params, ..._request });
  }
}
