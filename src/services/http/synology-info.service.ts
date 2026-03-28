import type { Observable } from 'rxjs';

import type { InfoResponse } from '../../models/synology.model';
import type { HttpParameters } from '../../utils/webex.utils';

import { CommonAPI, Endpoint, InfoMethod } from '../../models/synology.model';
import { HttpMethod } from '../../utils/webex.utils';
import { SynologyService } from './synology.service';

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
    return super.do<T>({ method, params, version, api, endpoint, base: baseUrl }, doNotProxy);
  }

  info(baseUrl?: string, options: { query?: string[]; doNotProxy?: boolean } = {}): Observable<InfoResponse> {
    const { query, doNotProxy } = { query: ['ALL'], doNotProxy: false, ...options };
    const params: HttpParameters = { method: InfoMethod.query, query: query?.join(',') };
    return this._do<InfoResponse>(HttpMethod.POST, params, { baseUrl, doNotProxy });
  }
}
