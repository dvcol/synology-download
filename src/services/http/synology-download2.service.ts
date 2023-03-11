import type { HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type {
  Api,
  CommonResponse,
  TaskCompleteResponse,
  TaskCreateRequest,
  TaskCreateResponse,
  TaskEditRequest,
  TaskEditResponse,
  TaskFileEditRequest,
  TaskListDownloadRequest,
  TaskListDownloadResponse,
  TaskListResponse,
} from '@src/models';
import { DownloadStation2API, Endpoint, TaskBtFileMethod, TaskBtMethod, TaskCompleteMethod, TaskCreateMethod } from '@src/models';
import { SynologyService } from '@src/services/http';

import { stringifyKeys } from '@src/utils';

import type { Observable } from 'rxjs';

export class SynologyDownload2Service extends SynologyService {
  constructor(isProxy = false, name = 'SynologyDownloadService2') {
    super(isProxy, name);
  }

  _do<T>({
    method,
    params,
    version,
    api,
    endpoint,
  }: {
    method: HttpMethod;
    params: HttpParameters;
    version: string;
    api?: Api;
    endpoint?: Endpoint;
  }): Observable<T> {
    return super.do<T>(method, params, version ?? '1', api ?? DownloadStation2API.Task, endpoint ?? Endpoint.Entry);
  }

  createTask(request: TaskCreateRequest, torrent?: Blob): Observable<TaskCreateResponse> {
    const params: HttpParameters = { method: TaskCreateMethod.create, ...stringifyKeys(request) };
    if (torrent) params.torrent = torrent;
    return this._do<TaskCreateResponse>({
      method: HttpMethod.POST,
      params,
      version: '2',
      api: DownloadStation2API.Task,
    });
  }

  getTaskList(list_id: string): Observable<TaskListResponse> {
    return this._do<TaskListResponse>({
      method: HttpMethod.POST,
      params: {
        method: TaskCreateMethod.get,
        list_id,
      },
      version: '2',
      api: DownloadStation2API.Task,
    });
  }

  getTaskListDownload(request: TaskListDownloadRequest): Observable<TaskListDownloadResponse> {
    return this._do<TaskListDownloadResponse>({
      method: HttpMethod.POST,
      params: {
        method: TaskCreateMethod.download,
        ...stringifyKeys(request),
      },
      version: '2',
      api: DownloadStation2API.TaskListPolling,
    });
  }

  stopTask(id: string | string[]): Observable<TaskCompleteResponse> {
    return this._do<TaskCompleteResponse>({
      method: HttpMethod.POST,
      params: {
        method: TaskCompleteMethod.start,
        id: Array.isArray(id) ? id : [id],
      },
      version: '1',
      api: DownloadStation2API.TaskComplete,
    });
  }

  getTaskEdit(task_id: string): Observable<TaskEditResponse> {
    return this._do<TaskEditResponse>({
      method: HttpMethod.POST,
      params: {
        method: TaskBtMethod.get,
        task_id,
      },
      version: '2',
      api: DownloadStation2API.TaskBt,
    });
  }

  editTask(request: TaskEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      method: HttpMethod.POST,
      params: {
        method: TaskBtMethod.set,
        ...stringifyKeys(request),
      },
      version: '2',
      api: DownloadStation2API.TaskBt,
    });
  }

  editFile(request: TaskFileEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      method: HttpMethod.POST,
      params: {
        method: TaskBtFileMethod.set,
        ...stringifyKeys(request),
      },
      version: '2',
      api: DownloadStation2API.TaskBtFile,
    });
  }
}
