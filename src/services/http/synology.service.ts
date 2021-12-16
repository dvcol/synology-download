import { BaseHttpService } from './base-http-service';
import { map, Observable } from 'rxjs';
import { Api, Controller, Endpoint, HttpMethod, HttpParameters, HttpResponse, SynologyError } from '../../models';
import { stringifyParams } from '../../utils';

export class SynologyService extends BaseHttpService {
  protected prefix = Controller.Common;
  private sid?: string;

  constructor(protected baseUrl = '', prefix = Controller.Common) {
    super(baseUrl + prefix);
    this.prefix = prefix;
  }

  setBaseUrl(baseUrl: string, prefix = this.prefix): void {
    super.setBaseUrl(baseUrl + prefix);
  }

  setSid(sid?: string): void {
    this.sid = sid;
  }

  query<T>(method: HttpMethod, params: HttpParameters, version: string, api: Api, endpoint: Endpoint): Observable<HttpResponse<T>> {
    if (this.sid) params.sid = this.sid;
    switch (method) {
      case HttpMethod.POST:
      case HttpMethod.post:
        return this.post<HttpResponse<T>>(endpoint, stringifyParams({ ...params, api, version }));
      case HttpMethod.PUT:
      case HttpMethod.put:
        return this.put<HttpResponse<T>>(endpoint, stringifyParams({ ...params, api, version }));
      case HttpMethod.DELETE:
      case HttpMethod.delete:
        return this.delete<HttpResponse<T>>(endpoint, { api, version, ...params });
      case HttpMethod.GET:
      case HttpMethod.get:
      default:
        return this.get<HttpResponse<T>>(endpoint, { api, version, ...params });
    }
  }

  do<T>(method: HttpMethod, params: HttpParameters, version: string, api: Api, endpoint: Endpoint): Observable<T> {
    return this.query<T>(method, params, version, api, endpoint).pipe(
      map((response) => {
        if (response?.success) {
          return response.data;
        } else {
          throw new SynologyError(api, response?.error);
        }
      })
    );
  }
}
