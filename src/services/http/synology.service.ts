import { catchError, map, of } from 'rxjs';

import type { BaseHttpRequest, HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type { Api, Endpoint, HttpResponse, SynologyQueryArgs, SynologyQueryPayload } from '@src/models';
import { AuthMethod, ChromeMessageType, Controller, SynologyError } from '@src/models';
import { LoggerService } from '@src/services';
import { buildFormData, onMessage, sendMessage, stringifyParams } from '@src/utils';

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

  query<T>(
    method: HttpMethod,
    params: HttpParameters,
    version: string,
    api: Api,
    endpoint: Endpoint,
    base?: string,
    formData?: boolean,
  ): Observable<HttpResponse<T>> {
    let url: BaseHttpRequest['url'] = endpoint;
    if (base) url = { base: base + this.prefix, path: endpoint };
    if (this.sid && params?.method !== AuthMethod.login) params._sid = this.sid;
    switch (method) {
      case HttpMethod.POST:
      case HttpMethod.post:
        return this.post<HttpResponse<T>>(url, formData ? buildFormData({ api, version, ...params }) : stringifyParams({ api, version, ...params }));
      case HttpMethod.PUT:
      case HttpMethod.put:
        return this.put<HttpResponse<T>>(url, formData ? buildFormData({ api, version, ...params }) : stringifyParams({ api, version, ...params }));
      case HttpMethod.DELETE:
      case HttpMethod.delete:
        return this.delete<HttpResponse<T>>(url, { api, version, ...params });
      case HttpMethod.GET:
      case HttpMethod.get:
      default:
        return this.get<HttpResponse<T>>(url, { api, version, ...params });
    }
  }

  forward<T>(...args: SynologyQueryArgs): Observable<T> {
    return sendMessage<SynologyQueryPayload, T>({ type: ChromeMessageType.query, payload: { id: this.name, args } });
  }

  do<T>(
    method: HttpMethod,
    params: HttpParameters,
    version: string,
    api: Api,
    endpoint: Endpoint,
    base?: string,
    formData?: boolean,
    doNotProxy?: boolean,
  ): Observable<T> {
    return (!doNotProxy && this.isProxy ? this.forward : this.query)
      .bind(this)<T>(method, params, version, api, endpoint, base, formData)
      .pipe(
        map(response => {
          if (response?.success === true) {
            return response.data;
          }
          if (response?.success === false) {
            throw new SynologyError(api, response?.error);
          }
          return response;
        }),
      );
  }
}
