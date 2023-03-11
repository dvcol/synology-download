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

type DoOptions = {
  method: HttpMethod;
  params: HttpParameters;
  version: string;
  api?: Api;
  endpoint?: Endpoint;
  base?: string;
  formData?: boolean;
  doNotProxy?: boolean;
};

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

  _do<T>({ method, params, version, api, endpoint, base, formData, doNotProxy }: DoOptions): Observable<T> {
    return super.do<T>(method, params, version ?? '1', api ?? DownloadStation2API.Task, endpoint ?? Endpoint.Entry, base, formData, doNotProxy);
  }

  createTask(request: TaskCreateRequest): Observable<TaskCreateResponse> {
    const { url, file, torrent, ..._request } = request;
    const params: HttpParameters = { method: TaskCreateMethod.create, ...stringifyKeys(_request, true) };
    if (url?.length) params.url = JSON.stringify(url?.map(_url => SynologyDownload2Service._sanitizeUrl(_url).toString()));
    if (torrent) {
      params.torrent = torrent;
      params.mtime = Date.now()?.toString();
      params.size = torrent.size?.toString();
      params.file = JSON.stringify(['torrent']);
    }
    const _params: DoOptions = {
      api: DownloadStation2API.Task,
      method: HttpMethod.POST,
      version: '2',
      endpoint: Endpoint.Entry,
      params,
    };
    if (params.torrent) {
      _params.doNotProxy = true;
      _params.formData = true;
    }
    return this._do<TaskCreateResponse>(_params);
  }

  getTaskList(list_id: string): Observable<TaskListResponse> {
    return this._do<TaskListResponse>({
      api: DownloadStation2API.Task,
      method: HttpMethod.POST,
      version: '2',
      params: {
        method: TaskCreateMethod.get,
        list_id,
      },
    });
  }

  getTaskListDownload(request: TaskListDownloadRequest): Observable<TaskListDownloadResponse> {
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
