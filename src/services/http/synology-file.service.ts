import { Observable } from 'rxjs';
import { API, Endpoint, HttpParameters, HttpResponse } from '../../models';
import { SynologyService } from './synology.service';

export class SynologyFileService extends SynologyService {
  commonTaskGet<T>(params: HttpParameters, version = '1', api = API.FileStationList, endpoint = Endpoint.Entry): Observable<HttpResponse<T>> {
    return super.commonTaskGet(params, version, api, endpoint);
  }
}
