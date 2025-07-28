import { catchError, map, of } from 'rxjs';

import type { HttpResponse, SynologyQueryArgs, SynologyQueryOptions, SynologyQueryPayload } from '@src/models';
import { AuthMethod, ChromeMessageType, Controller, CustomHeader, SynologyError } from '@src/models';
import { LoggerService } from '@src/services';
import type { BaseHttpRequest, HttpHeaders } from '@src/utils';
import { HttpMethod, onMessage, sendMessage, stringifyParams } from '@src/utils';

import { BaseHttpService } from './base-http.service';

import type { Observable } from 'rxjs';

export class SynologyService extends BaseHttpService {
  protected sid?: string;

  constructor(protected isProxy = false, protected name = 'SynologyService', protected prefix = Controller.Common) {
    super(prefix);

    if (!isProxy) this.listen();
  }

  listen(name = this.name): void {
    onMessage<SynologyQueryPayload>([ChromeMessageType.query]).subscribe(({ message: { payload }, sendResponse }) => {
      if (payload?.id === name) {
        this.query(...(payload?.args ?? []))
          .pipe(
            map(response => ({ success: true, payload: response })),
            catchError(error => {
              LoggerService.error('Forwarded method failed.', { payload, error });
              return of({ success: false, error: { name: error?.name, message: error?.message } });
            }),
          )
          .subscribe(response => sendResponse(response));
      }
    });
  }

  setBaseUrl(baseUrl: string, prefix = this.prefix): void {
    super.setBaseUrl(baseUrl + prefix);
  }

  setSid(sid?: string): void {
    this.sid = sid;
  }

  query<T>({ method: httpMethod, params, body: httpBody, version, api, endpoint, base }: SynologyQueryOptions): Observable<HttpResponse<T>> {
    const { method, ..._params } = params ?? {};
    let url: BaseHttpRequest['url'] = endpoint;

    if (base) url = { base: base + this.prefix, path: endpoint };
    if (this.sid && params?.method !== AuthMethod.login) _params._sid = this.sid;

    const _body = httpBody ?? stringifyParams({ api, method, version, ..._params });
    // BodyInit | string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array> | null | undefined;
    if (this.sid && params?.method !== AuthMethod.login && httpBody) {
      if (httpBody instanceof FormData || httpBody instanceof URLSearchParams) httpBody.set('_sid', this.sid);
      else if (typeof httpBody === 'object' && !Array.isArray(httpBody)) Object.assign(httpBody, { _sid: this.sid });
    }

    const headers: HttpHeaders = { 'Access-Control-Allow-Origin': '*', [CustomHeader.SynologyDownloadApp]: this.name };
    if (this.sid) headers.Credentials = 'omit';
    if (!httpBody) headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';

    switch (httpMethod) {
      case HttpMethod.POST:
      case HttpMethod.post:
        return this.post<HttpResponse<T>>(url, _body, undefined, headers);
      case HttpMethod.PUT:
      case HttpMethod.put:
        return this.put<HttpResponse<T>>(url, _body, undefined, headers);
      case HttpMethod.DELETE:
      case HttpMethod.delete:
        return this.delete<HttpResponse<T>>(url, { api, method, version, ..._params }, headers);
      case HttpMethod.GET:
      case HttpMethod.get:
      default:
        return this.get<HttpResponse<T>>(url, { api, method, version, ..._params }, headers);
    }
  }

  forward<T>(...args: SynologyQueryArgs): Observable<T> {
    return sendMessage<SynologyQueryPayload, T>({ type: ChromeMessageType.query, payload: { id: this.name, args } });
  }

  do<T>(options: SynologyQueryOptions, doNotProxy?: boolean): Observable<T> {
    return (!doNotProxy && this.isProxy ? this.forward : this.query)
      .bind(this)<T>(options)
      .pipe(
        map(response => {
          if (response?.success === true) {
            return response.data;
          }
          if (response?.success === false) {
            throw new SynologyError(options.api, response?.error);
          }
          return response;
        }),
      );
  }
}
