import { Observable } from 'rxjs';
import {
  API,
  CommonResponse,
  Controller,
  Endpoint,
  HttpParameters,
  HttpResponse,
  InfoResponse,
  ListResponse,
  SynologyMethod,
  TaskListOption,
} from '../../models';
import { SynologyService } from './synology.service';

export class SynologyDownloadService extends SynologyService {
  constructor(protected baseUrl = '', prefix = Controller.DownloadStation) {
    super(baseUrl, prefix);
  }

  commonTaskGet<T>(params: HttpParameters, version = '1', api = API.DownloadStationTask, endpoint = Endpoint.Task): Observable<HttpResponse<T>> {
    return super.commonTaskGet(params, version, api, endpoint);
  }

  info(query: string[] = ['ALL']): Observable<HttpResponse<InfoResponse>> {
    const params: HttpParameters = { method: SynologyMethod.query, query: query?.join(',') };
    return this.commonTaskGet<InfoResponse>(params);
  }

  listTasks(
    additional: TaskListOption[] = [TaskListOption.detail, TaskListOption.file, TaskListOption.transfer],
    offset = 0,
    limit = -1
  ): Observable<HttpResponse<ListResponse>> {
    const params: HttpParameters = { method: SynologyMethod.list };
    if (additional?.length) params.additional = `${additional}`;
    if (offset) params.offset = `${offset}`;
    if (limit) params.limit = `${limit}`;
    return this.commonTaskGet<ListResponse>(params);
  }

  createTask(uri: string, destination?: string, username?: string, password?: string, unzip?: string): Observable<HttpResponse<void>> {
    const params: HttpParameters = { method: SynologyMethod.create, uri };
    if (destination) params.destination = destination;
    if (username) params.username = username;
    if (password) params.password = password;
    if (unzip) params.unzip = unzip;
    return this.commonTaskGet<void>(params);
  }

  deleteTask(id: string | string[], force = false): Observable<HttpResponse<CommonResponse[]>> {
    return this.commonTaskGet<CommonResponse[]>({
      method: SynologyMethod.delete,
      id,
      force_complete: `${force}`,
    });
  }

  pauseTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
    return this.commonTaskGet<CommonResponse[]>({
      method: SynologyMethod.pause,
      id,
    });
  }

  resumeTask(id: string | string[]): Observable<HttpResponse<CommonResponse[]>> {
    return this.commonTaskGet<CommonResponse[]>({
      method: SynologyMethod.resume,
      id,
    });
  }

  editTask(id: string | string[], destination: string): Observable<HttpResponse<CommonResponse[]>> {
    return this.commonTaskGet<CommonResponse[]>({
      method: SynologyMethod.edit,
      id,
      destination,
    });
  }
}
