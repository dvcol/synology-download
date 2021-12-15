import { Observable } from 'rxjs';
import { API, Endpoint, HttpParameters, HttpResponse, LoginResponse, SessionName, SynologyMethod } from '../../models';
import { SynologyService } from './synology.service';

export class SynologyAuthService extends SynologyService {
  commonTaskGet<T>(params: HttpParameters, version = '1', api = API.Auth, endpoint = Endpoint.Auth): Observable<HttpResponse<T>> {
    return super.commonTaskGet(params, version, api, endpoint);
  }
  login(account: string, passwd: string, otp_code?: string): Observable<HttpResponse<LoginResponse>> {
    const params: HttpParameters = {
      method: SynologyMethod.login,
      session: SessionName.DiskStation,
      format: 'sid',
      account,
      passwd,
    };
    if (otp_code) params.otp_code = otp_code;
    return this.commonTaskGet<LoginResponse>(params, '2');
  }

  logout(): Observable<HttpResponse<void>> {
    const params: HttpParameters = { method: SynologyMethod.logout, session: SessionName.DiskStation };
    return this.commonTaskGet<void>(params);
  }
}
