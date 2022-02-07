import { Observable } from 'rxjs';
import { AuthMethod, CommonAPI, Endpoint, HttpMethod, HttpParameters, LoginResponse, SessionName } from '@src/models';
import { SynologyService } from '@src/services/http';

// TODO : handle HTTPS & 2FA
export class SynologyAuthService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyAuthService') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = CommonAPI.Auth, endpoint = Endpoint.Auth): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }

  login(
    account: string,
    passwd: string,
    otp_code?: string,
    deviceToken?: 'yes' | 'no',
    deviceName?: string,
    deviceId?: number,
    format: 'cookie' | 'sid' = 'cookie'
  ): Observable<LoginResponse> {
    const params: HttpParameters = {
      method: AuthMethod.login,
      session: SessionName.DiskStation,
      format,
      account,
      passwd,
    };
    if (otp_code) params.otp_code = otp_code;
    return this._do<LoginResponse>(HttpMethod.POST, params, '2');
  }

  logout(): Observable<void> {
    const params: HttpParameters = { method: AuthMethod.logout, session: SessionName.DiskStation };
    return this._do<void>(HttpMethod.PUT, params);
  }
}
