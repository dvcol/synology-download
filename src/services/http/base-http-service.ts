import { Observable } from 'rxjs';
import { BaseHttpRequest, Body, HttpHeaders, HttpMethod, HttpParameters } from '../../models';

/** Base Http request class implementation*/
export class BaseHttpService {
  constructor(protected baseUrl: string = '') {}

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  buildUrl(url: string | URL, params?: HttpParameters): URL {
    const builder = new URL(`${this.baseUrl}/${url}`);
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
    return new Observable<T>((observer) => {
      // Controller for abort-able fetch request
      const controller = new AbortController();
      fetch(this.buildUrl(url, params).toString(), {
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

  get<T>(url: string = '', params?: HttpParameters, headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*' }): Observable<T> {
    return this.request({ url, method: HttpMethod.GET, params, headers });
  }

  post<T>(
    body: Body,
    url: string = '',
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
    body: Body,
    url: string = '',
    params?: HttpParameters,
    headers: HttpHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  ): Observable<T> {
    return this.request({ url, method: HttpMethod.PUT, params, headers, body });
  }

  delete<T>(url: string = '', params?: HttpParameters, headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*' }): Observable<T> {
    return this.request({ url, method: HttpMethod.DELETE, params, headers });
  }
}
