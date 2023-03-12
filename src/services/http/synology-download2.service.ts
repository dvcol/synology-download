import type { HttpParameters } from '@dvcol/web-extension-utils';
import { HttpMethod } from '@dvcol/web-extension-utils';

import type {
  CommonResponse,
  SynologyQueryOptions,
  TaskCompleteResponse,
  TaskCreateRequest,
  TaskCreateResponse,
  TaskEditRequest,
  TaskEditResponse,
  TaskFileEditRequest,
  TaskListDeleteRequest,
  TaskListDeleteResponse,
  TaskListDownloadRequest,
  TaskListDownloadResponse,
  TaskListResponse,
} from '@src/models';
import {
  DownloadStation2API,
  Endpoint,
  EntryAPI,
  EntryMethod,
  TaskBtFileMethod,
  TaskBtMethod,
  TaskCompleteMethod,
  TaskCreateMethod,
} from '@src/models';
import { SynologyService } from '@src/services/http';

import { buildFormData, stringifyKeys } from '@src/utils';

import type { Observable } from 'rxjs';

export class SynologyDownload2Service extends SynologyService {
  /**
   * Synology uses comma in a non standardized way to delimit array payload in the API.
   * This makes urls containing un-encoded commas though technically non-malformed, invalid for the API.
   *
   * To palliate this, we substitute comma with it's unicode equivalent before encoding parameters
   *
   * @param url the url to sanitize
   * @private
   *
   * @see https://global.download.synology.com/download/Document/Software/DeveloperGuide/Package/DownloadStation/All/enu/Synology_Download_Station_Web_API.pdf
   */
  private static _sanitizeUrl(url: string): URL {
    return new URL(url.toString().replace(/,/g, '%2C'));
  }

  constructor(isProxy = false, name = 'SynologyDownloadService2') {
    super(isProxy, name);
  }

  _do<T>(
    { method, params, body, version, api, endpoint, base }: Partial<SynologyQueryOptions> & { method: HttpMethod },
    doNotProxy?: boolean,
  ): Observable<T> {
    return super.do<T>(
      {
        api: api ?? DownloadStation2API.Task,
        method,
        version: version ?? '1',
        body,
        params,
        endpoint: endpoint ?? Endpoint.Entry,
        base,
      },
      doNotProxy,
    );
  }

  createTask(request: TaskCreateRequest): Observable<TaskCreateResponse> {
    const { url, file, torrent, ..._request } = request;
    const params: HttpParameters = stringifyKeys(_request, true);
    if (url?.length) params.url = JSON.stringify(url?.map(_url => SynologyDownload2Service._sanitizeUrl(_url).toString()));

    const options: SynologyQueryOptions = {
      api: DownloadStation2API.Task,
      method: HttpMethod.POST,
      version: '2',
      endpoint: Endpoint.Entry,
    };
    if (torrent) {
      options.body = buildFormData({
        api: DownloadStation2API.Task,
        method: TaskCreateMethod.create,
        version: '2',
        ...params,
        torrent,
        mtime: Date.now()?.toString(),
        size: torrent.size?.toString(),
        file: JSON.stringify(['torrent']),
      });
    } else {
      options.params = {
        method: TaskCreateMethod.create,
        ...params,
      };
    }

    return this._do<TaskCreateResponse>(options, !!torrent);
  }

  getTaskList(list_id: string): Observable<TaskListResponse> {
    return this._do<TaskListResponse>({
      api: DownloadStation2API.TaskList,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskCreateMethod.get,
        list_id,
      },
    });
  }

  setTaskListDownload(request: TaskListDownloadRequest): Observable<TaskListDownloadResponse> {
    return this._do<TaskListDownloadResponse>({
      api: DownloadStation2API.TaskListPolling,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskCreateMethod.download,
        ...stringifyKeys(request),
      },
    });
  }

  deleteTaskList(list_id: string): Observable<TaskListDeleteResponse> {
    const request: TaskListDeleteRequest = {
      mode: 'sequential',
      stop_when_error: false,
      compound: [
        {
          api: DownloadStation2API.TaskList,
          method: TaskCreateMethod.delete,
          version: '2',
          list_id,
        },
      ],
    };
    return this._do<TaskListDeleteResponse>({
      api: EntryAPI.request,
      method: HttpMethod.POST,
      version: '1',
      params: {
        method: EntryMethod.request,
        ...stringifyKeys(request),
        compound: JSON.stringify(request.compound),
      },
    });
  }

  stopTask(id: string | string[]): Observable<TaskCompleteResponse> {
    return this._do<TaskCompleteResponse>({
      api: DownloadStation2API.TaskComplete,
      method: HttpMethod.POST,
      version: '1',
      params: {
        method: TaskCompleteMethod.start,
        id: Array.isArray(id) ? id : [id],
      },
    });
  }

  getTaskEdit(task_id: string): Observable<TaskEditResponse> {
    return this._do<TaskEditResponse>({
      api: DownloadStation2API.TaskBt,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskBtMethod.get,
        task_id,
      },
    });
  }

  editTask(request: TaskEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      api: DownloadStation2API.TaskBt,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskBtMethod.set,
        ...stringifyKeys(request),
      },
    });
  }

  editFile(request: TaskFileEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      api: DownloadStation2API.TaskBtFile,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskBtFileMethod.set,
        ...stringifyKeys(request),
      },
    });
  }
}
