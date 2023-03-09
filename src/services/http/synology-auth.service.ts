import type { HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type { LoginRequest, LoginResponse } from '@src/models';
import { AuthMethod, CommonAPI, Endpoint, SessionName } from '@src/models';
import { SynologyService } from '@src/services/http';

import type { Observable } from 'rxjs';

export class SynologyAuthService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyAuthService') {
    super(isProxy, name);
  }

  _do<T>(
    method: HttpMethod,
    params: HttpParameters,
    options: { baseUrl?: string; version?: string; api?: CommonAPI; endpoint?: Endpoint; doNotProxy?: boolean } = {},
  ): Observable<T> {
    const { baseUrl, version, api, endpoint, doNotProxy } = {
      version: '1',
      api: CommonAPI.Auth,
      endpoint: Endpoint.Auth,
      doNotProxy: false,
      ...options,
    };
    return super.do<T>(method, params, version, api, endpoint, baseUrl, doNotProxy);
  }

  login(
    { account, passwd, baseUrl, otp_code, enable_device_token, device_name, device_id, format }: LoginRequest,
    version = '3',
    doNotProxy?: boolean,
  ): Observable<LoginResponse> {
    const params: HttpParameters = {
      method: AuthMethod.login,
      session: SessionName.DownloadStation,
      format: format ?? 'cookie',
      account,
      passwd,
    };
    if (otp_code) params.otp_code = otp_code;
    if (enable_device_token) params.enable_device_token = enable_device_token;
    if (device_name) params.device_name = device_name;
    if (device_id) params.device_id = device_id;
    return this._do<LoginResponse>(HttpMethod.POST, params, { baseUrl, version, doNotProxy });
  }

  logout(): Observable<void> {
    const params: HttpParameters = { method: AuthMethod.logout, session: SessionName.DownloadStation };
    return this._do<void>(HttpMethod.POST, params);
  }
}
