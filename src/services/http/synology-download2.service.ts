import { throwError } from 'rxjs';

import type {
  CommonResponse,
  SynologyQueryOptions,
  TaskBtEditRequest,
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
  TaskListFilesRequest,
  TaskListFilesResponse,
  TaskListResponse,
} from '@src/models';
import { DownloadStation2API, Endpoint, EntryAPI, EntryMethod, Task2Method } from '@src/models';
import { SynologyService } from '@src/services/http';
import type { HttpParameters } from '@src/utils';
import { buildFormData, HttpMethod, stringifyKeys } from '@src/utils';

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
    try {
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
          method: Task2Method.create,
          version: '2',
          ...params,
          torrent,
          mtime: Date.now()?.toString(),
          size: torrent.size?.toString(),
          file: JSON.stringify(['torrent']),
        });
      } else {
        options.params = {
          method: Task2Method.create,
          ...params,
        };
      }

      return this._do<TaskCreateResponse>(options, !!torrent);
    } catch (error) {
      return throwError(error);
    }
  }

  getTaskFiles(request: TaskListFilesRequest): Observable<TaskListFilesResponse> {
    return this._do<TaskListFilesResponse>({
      api: DownloadStation2API.TaskBtFile,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.list,
        ...stringifyKeys(request),
      },
    });
  }

  getTaskList(list_id: string): Observable<TaskListResponse> {
    return this._do<TaskListResponse>({
      api: DownloadStation2API.TaskList,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.get,
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
        method: Task2Method.download,
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
          method: Task2Method.delete,
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
        method: Task2Method.start,
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
        method: Task2Method.get,
        task_id,
      },
    });
  }

  editTask(request: TaskEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      api: DownloadStation2API.Task,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.edit,
        ...stringifyKeys(request),
      },
    });
  }

  editTaskBt(request: TaskBtEditRequest): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>({
      api: DownloadStation2API.TaskBt,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: Task2Method.set,
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
        method: Task2Method.set,
        ...stringifyKeys(request),
      },
    });
  }
}
