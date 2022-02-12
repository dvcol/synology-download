import { Observable, throwError } from 'rxjs';
import { BaseHttpRequest, Body, HttpHeaders, HttpMethod, HttpParameters } from '@src/models';

/** Base Http request class implementation*/
export class BaseHttpService {
  constructor(protected baseUrl: string = '') {}

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  buildUrl(url: BaseHttpRequest['url'], params?: HttpParameters): URL {
    const _url = typeof url === 'string' || url instanceof URL ? `${this.baseUrl}/${url}` : `${url.base}/${url.path}`;
    const builder = new URL(_url);
    if (params) {
      Object.entries(params)
        .map((e) => ({ key: e[0], value: e[1] }))
        .forEach(({ key, value }) =>
          Array.isArray(value) ? value.forEach((val) => builder.searchParams.append(key, val)) : builder.searchParams.append(key, value)
        );
    }
    return builder;
  }

  request<T>({ url, method, headers, params, body }: BaseHttpRequest): Observable<T> {
    let _url: string;
    try {
      _url = this.buildUrl(url, params).toString();
    } catch (error) {
      console.debug('Failed to build urp for ', this.baseUrl, url, params);
      return throwError(() => error);
    }
    return new Observable<T>((observer) => {
      // Controller for abort-able fetch request
      const controller = new AbortController();
      fetch(_url, {
        method,
        headers,
        body,
        signal: controller.signal,
      })
        .then((r: Response) => r.json())
        .then((data: T) => {
          observer.next(data);
          observer.complete();
        })
        .catch((e: any) => observer.error(e));
      // Abort fetch on unsubscribe
      return () => controller.abort();
    });
  }

  get<T>(url: BaseHttpRequest['url'], params?: HttpParameters, headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*' }): Observable<T> {
    return this.request({ url, method: HttpMethod.GET, params, headers });
  }

  post<T>(
    url: BaseHttpRequest['url'],
    body: Body,
    params?: HttpParameters,
    headers: HttpHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  ): Observable<T> {
    return this.request({
      url,
      method: HttpMethod.POST,
      params,
      headers,
      body,
    });
  }

  put<T>(
    url: BaseHttpRequest['url'],
    body: Body,
    params?: HttpParameters,
    headers: HttpHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  ): Observable<T> {
    return this.request({ url, method: HttpMethod.PUT, params, headers, body });
  }

  delete<T>(url: BaseHttpRequest['url'], params?: HttpParameters, headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*' }): Observable<T> {
    return this.request({ url, method: HttpMethod.DELETE, params, headers });
  }
}
