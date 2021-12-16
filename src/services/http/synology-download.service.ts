import { Observable } from 'rxjs';
import {
  CommonResponse,
  Controller,
  DownloadStationAPI,
  Endpoint,
  HttpMethod,
  HttpParameters,
  ListResponse,
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

  listTasks(
    additional: TaskListOption[] = [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer],
    offset = 0,
    limit = -1
  ): Observable<ListResponse> {
    const params: HttpParameters = { method: TaskMethod.list };
    if (additional?.length) params.additional = `${additional}`;
    if (offset) params.offset = `${offset}`;
    if (limit) params.limit = `${limit}`;
    return this._do<ListResponse>(HttpMethod.POST, params);
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
