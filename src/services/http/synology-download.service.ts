import { Observable } from 'rxjs';
import {
  CommonResponse,
  Controller,
  DownloadStationAPI,
  Endpoint,
  HttpMethod,
  HttpParameters,
  TaskList,
  TaskListOption,
  TaskMethod,
} from '../../models';
import { SynologyService } from './synology.service';

export class SynologyDownloadService extends SynologyService {
  constructor(protected baseUrl = '', prefix = Controller.DownloadStation) {
    super(baseUrl, prefix);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '1', api = DownloadStationAPI.Task, endpoint = Endpoint.Task): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
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
    return this._do<CommonResponse[]>(HttpMethod.PUT, {
      method: TaskMethod.edit,
      id,
      destination,
    });
  }
}
