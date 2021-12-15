import { BaseHttpService } from './base-http-service';
import { Observable } from 'rxjs';
import { API, Controller, Endpoint, HttpParameters, HttpResponse } from '../../models';

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

  commonTaskGet<T>(params: HttpParameters, version: string, api: API, endpoint: Endpoint): Observable<HttpResponse<T>> {
    if (this.sid) params.sid = this.sid;
    return this.get<HttpResponse<T>>(endpoint, { api, version, ...params });
  }
}
