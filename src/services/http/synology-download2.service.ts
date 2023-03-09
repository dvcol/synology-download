import type { HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type { CommonResponse, TaskEditRequest, TaskFileEditRequest, TaskCompleteResponse } from '@src/models';
import { DownloadStation2API, Endpoint, TaskBtFileMethod, TaskBtMethod, TaskCompleteMethod } from '@src/models';
import { SynologyService } from '@src/services/http';

import { stringifyKeys } from '@src/utils';

import type { Observable } from 'rxjs';

export class SynologyDownload2Service extends SynologyService {
  constructor(isProxy = false, name = 'SynologyDownloadService2') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = DownloadStation2API.Task, endpoint = Endpoint.Entry): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }

  stopTask(id: string | string[]): Observable<TaskCompleteResponse> {
    return this._do<TaskCompleteResponse>(
      HttpMethod.POST,
      {
        method: TaskCompleteMethod.start,
        id: Array.isArray(id) ? id : [id],
      },
      '1',
      DownloadStation2API.TaskComplete,
    );
  }

  editTask(request: TaskEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(
      HttpMethod.PUT,
      {
        method: TaskBtMethod.set,
        ...stringifyKeys(request),
      },
      '2',
      DownloadStation2API.TaskBt,
    );
  }

  editFile(request: TaskFileEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(
      HttpMethod.PUT,
      {
        method: TaskBtFileMethod.set,
        ...stringifyKeys(request),
      },
      '2',
      DownloadStation2API.TaskBtFile,
    );
  }
}
