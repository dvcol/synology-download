import { Observable } from 'rxjs';
import { CommonAPI, Endpoint, HttpMethod, HttpParameters, InfoMethod, InfoResponse } from '../../models';
import { SynologyService } from './synology.service';

export class SynologyInfoService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyInfoService') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = CommonAPI.Info, endpoint = Endpoint.Query): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }

  info(query: string[] = ['ALL']): Observable<InfoResponse> {
    const params: HttpParameters = { method: InfoMethod.query, query: query?.join(',') };
    return this._do<InfoResponse>(HttpMethod.GET, params);
  }
}
