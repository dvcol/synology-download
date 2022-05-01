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
    baseUrl?: string,
    version = '1',
    api = CommonAPI.Info,
    endpoint = Endpoint.Query,
  ): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint, baseUrl);
  }

  info(baseUrl?: string, query: string[] = ['ALL']): Observable<InfoResponse> {
    const params: HttpParameters = { method: InfoMethod.query, query: query?.join(',') };
    return this._do<InfoResponse>(HttpMethod.GET, params, baseUrl);
  }
}
