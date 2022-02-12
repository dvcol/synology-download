import { BaseHttpService } from './base-http-service';
import { catchError, map, Observable, of } from 'rxjs';
import {
  Api,
  BaseHttpRequest,
  ChromeMessageType,
  Controller,
  Endpoint,
  HttpMethod,
  HttpParameters,
  HttpResponse,
  SynologyError,
  SynologyQueryArgs,
  SynologyQueryPayload,
} from '@src/models';
import { onMessage, sendMessage, stringifyParams } from '@src/utils';

export class SynologyService extends BaseHttpService {
  protected sid?: string;

  constructor(protected isProxy = false, protected name: string = 'SynologyService', protected prefix = Controller.Common) {
    super(prefix);

    if (!isProxy) this.listen();
  }

  listen(name = this.name): void {
    onMessage<SynologyQueryPayload>([ChromeMessageType.query], true).subscribe(({ message: { payload }, sendResponse }) => {
      if (payload?.id === name) {
        this.query(...payload?.args)
          .pipe(
            map((response) => ({ success: true, payload: response })),
            catchError((error) => of({ success: false, error }))
          )
          .subscribe((response) => sendResponse(response));
      }
    });
  }

  setBaseUrl(baseUrl: string, prefix = this.prefix): void {
    super.setBaseUrl(baseUrl + prefix);
  }

  setSid(sid?: string): void {
    this.sid = sid;
  }

  query<T>(method: HttpMethod, params: HttpParameters, version: string, api: Api, endpoint: Endpoint, base?: string): Observable<HttpResponse<T>> {
    let url: BaseHttpRequest['url'] = endpoint;
    if (base) url = { base: base + this.prefix, path: endpoint };
    if (this.sid) params._sid = this.sid;
    switch (method) {
      case HttpMethod.POST:
      case HttpMethod.post:
        console.log('login', url);
        return this.post<HttpResponse<T>>(url, stringifyParams({ ...params, api, version }));
      case HttpMethod.PUT:
      case HttpMethod.put:
        return this.put<HttpResponse<T>>(url, stringifyParams({ ...params, api, version }));
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

  do<T>(method: HttpMethod, params: HttpParameters, version: string, api: Api, endpoint: Endpoint, base?: string): Observable<T> {
    return (this.isProxy ? this.forward : this.query)
      .bind(this)<T>(method, params, version, api, endpoint, base)
      .pipe(
        map((response) => {
          if (response?.success === true) {
            return response.data;
          } else if (response?.success === false) {
            throw new SynologyError(api, response?.error);
          }
          return response;
        })
      );
  }
}
