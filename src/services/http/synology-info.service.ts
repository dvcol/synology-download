import type { HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type { InfoResponse } from '@src/models';
import { CommonAPI, Endpoint, InfoMethod } from '@src/models';
import { SynologyService } from '@src/services/http';

import type { Observable } from 'rxjs';

export class SynologyInfoService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyInfoService') {
    super(isProxy, name);
  }

  _do<T>(
    method: HttpMethod,
    params: HttpParameters,
    options: { baseUrl?: string; version?: string; api?: CommonAPI; endpoint?: Endpoint; doNotProxy?: boolean } = {},
  ): Observable<T> {
    const { baseUrl, version, api, endpoint, doNotProxy } = {
      version: '1',
      api: CommonAPI.Info,
      endpoint: Endpoint.Query,
      doNotProxy: false,
      ...options,
    };
    return super.do<T>(method, params, version, api, endpoint, baseUrl, doNotProxy);
  }

  info(baseUrl?: string, options: { query?: string[]; doNotProxy?: boolean } = {}): Observable<InfoResponse> {
    const { query, doNotProxy } = { query: ['ALL'], doNotProxy: false, ...options };
    const params: HttpParameters = { method: InfoMethod.query, query: query?.join(',') };
    return this._do<InfoResponse>(HttpMethod.GET, params, { baseUrl, doNotProxy });
  }
}
