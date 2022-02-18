import { Observable } from 'rxjs';

import {
  CommonResponse,
  Controller,
  DownloadStationAPI,
  DownloadStationConfig,
  DownloadStationInfo,
  DownloadStationStatistic,
  Endpoint,
  HttpMethod,
  HttpParameters,
  TaskList,
  TaskListOption,
  TaskMethod,
} from '@src/models';
import { SynologyService } from '@src/services/http';

export class SynologyDownloadService extends SynologyService {
  constructor(isProxy = false, name = 'SynologyDownloadService', prefix = Controller.DownloadStation) {
    super(isProxy, name, prefix);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = DownloadStationAPI.Task, endpoint = Endpoint.Task): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }

  getConfig(): Observable<DownloadStationConfig> {
    return this._do(HttpMethod.POST, { method: TaskMethod.getConfig }, '1', DownloadStationAPI.Info, Endpoint.Info);
  }

  setConfig(config: DownloadStationConfig): Observable<CommonResponse> {
    const _config = (Object.keys(config) as (keyof DownloadStationConfig)[]).reduce((acc, key) => {
      if (config[key] !== undefined && config[key] !== null) acc[key] = `${config[key]}`;
      return acc;
    }, {} as HttpParameters);
    return this._do(HttpMethod.POST, { method: TaskMethod.setConfig, ..._config }, '1', DownloadStationAPI.Info, Endpoint.Info);
  }

  getInfo(): Observable<DownloadStationInfo> {
    return this._do(HttpMethod.POST, { method: TaskMethod.getInfo }, '1', DownloadStationAPI.Info, Endpoint.Info);
  }

  getStatistic(): Observable<DownloadStationStatistic> {
    return this._do(HttpMethod.POST, { method: TaskMethod.getInfo }, '1', DownloadStationAPI.Statistic, Endpoint.Statistic);
  }

  /**
   * List all tasks
   * @param offset Beginning task on the requested record. Default to “0”
   * @param limit Number of records requested: “-1” means to list all tasks. Default to “-1”.
   * @param additional Additional requested info, separated by ",". When an additional option is requested, objects will be provided in the specified additional option.
   */
  listTasks(offset?: number, limit?: number, additional?: TaskListOption[]): Observable<TaskList> {
    const params: HttpParameters = { method: TaskMethod.list };
    if (additional?.length) params.additional = `${additional}`;
    if (offset) params.offset = `${offset}`;
    if (limit) params.limit = `${limit}`;
    return this._do<TaskList>(HttpMethod.POST, params);
  }

  createTask(uri: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<void> {
    const params: HttpParameters = { method: TaskMethod.create, uri };
    if (destination) params.destination = destination;
    if (username) params.username = username;
    if (password) params.password = password;
    if (unzip) params.unzip = unzip;
    return this._do<void>(HttpMethod.POST, params);
  }

  deleteTask(id: string | string[], force = false): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(HttpMethod.PUT, {
      method: TaskMethod.delete,
      id,
      force_complete: `${force}`,
    });
  }

  pauseTask(id: string | string[]): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(HttpMethod.PUT, {
      method: TaskMethod.pause,
      id,
    });
  }

  resumeTask(id: string | string[]): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(HttpMethod.PUT, {
      method: TaskMethod.resume,
      id,
    });
  }

  editTask(id: string | string[], destination: string): Observable<CommonResponse[]> {
    return this._do<CommonResponse[]>(
      HttpMethod.PUT,
      {
        method: TaskMethod.edit,
        id,
        destination,
      },
      '2'
    );
  }
}
