import { Observable } from 'rxjs';
import { API, Endpoint, HttpParameters, HttpResponse, InfoResponse, SynologyMethod } from '../../models';
import { SynologyService } from './synology.service';

export class SynologyInfoService extends SynologyService {
  commonTaskGet<T>(params: HttpParameters, version = '1', api = API.Info, endpoint = Endpoint.Query): Observable<HttpResponse<T>> {
    return super.commonTaskGet(params, version, api, endpoint);
  }

  info(query: string[] = ['ALL']): Observable<HttpResponse<InfoResponse>> {
    const params: HttpParameters = { method: SynologyMethod.query, query: query?.join(',') };
    return this.commonTaskGet<InfoResponse>(params);
  }
}
