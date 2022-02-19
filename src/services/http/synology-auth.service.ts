import { Observable } from 'rxjs';

import { AuthMethod, CommonAPI, Endpoint, HttpMethod, HttpParameters, LoginRequest, LoginResponse, SessionName } from '@src/models';
import { SynologyService } from '@src/services/http';

export class SynologyAuthService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyAuthService') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = CommonAPI.Auth, endpoint = Endpoint.Auth, baseUrl?: string): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint, baseUrl);
  }

  login(
    { account, passwd, baseUrl, otp_code, enable_device_token, device_name, device_id, format }: LoginRequest,
    authVersion = '1'
  ): Observable<LoginResponse> {
    const params: HttpParameters = {
      method: AuthMethod.login,
      session: SessionName.DiskStation,
      format: format ?? 'cookie',
      account,
      passwd,
    };
    if (otp_code) params.otp_code = otp_code;
    if (enable_device_token) params.enable_device_token = enable_device_token;
    if (device_name) params.device_name = device_name;
    if (device_id) params.device_id = device_id;
    return this._do<LoginResponse>(HttpMethod.POST, params, authVersion, CommonAPI.Auth, Endpoint.Auth, baseUrl);
  }

  logout(): Observable<void> {
    const params: HttpParameters = { method: AuthMethod.logout, session: SessionName.DiskStation };
    return this._do<void>(HttpMethod.PUT, params);
  }
}
