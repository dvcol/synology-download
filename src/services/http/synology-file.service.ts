import { Observable } from 'rxjs';
import { Endpoint, FileStationAPI, HttpMethod, HttpParameters } from '../../models';
import { SynologyService } from './synology.service';

export class SynologyFileService extends SynologyService {
  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = FileStationAPI.Info, endpoint = Endpoint.Query): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }
}
