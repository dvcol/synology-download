import { Observable } from 'rxjs';
import {
  Endpoint,
  FileList,
  FileListOption,
  FileMethod,
  FileSortBy,
  FileStationAPI,
  FolderList,
  FolderListOption,
  FolderSortBy,
  HttpMethod,
  HttpParameters,
} from '@src/models';
import { SynologyService } from '@src/services/http';

export class SynologyFileService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyFileService') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '2', api = FileStationAPI.List, endpoint = Endpoint.Entry): Observable<T> {
    return super.do<T>(method, params, version, api, endpoint);
  }

  /**
   * List all network share
   * @param offset  Specify how many shared folders are skipped before beginning to return listed shared folders. Defaults to 0.
   * @param limit  Number of shared folders requested. 0 lists all shared folders. Defaults to 0.
   * @param onlywritable true : List writable shared folders. false : List writable and read-only shared folders
   * @param sort_by Specify which file information to sort on. Defaults to 'name'.
   * @param sort_direction Specify to sort ascending or to sort descending. Defaults to 'asc'.
   * @param additional Additional requested file information separated by a comma "," and around the brackets.
   * When an additional option is requested, responded objects will be provided in the specified additional option.
   */
  listFolder(
    offset?: number,
    limit?: number,
    onlywritable?: boolean,
    sort_by?: FolderSortBy,
    sort_direction?: 'asc' | 'dsc',
    additional?: FolderListOption[]
  ): Observable<FolderList> {
    const params: HttpParameters = { method: FileMethod.listShare };
    if (offset) if (offset) params.offset = `${offset}`;
    if (limit) params.limit = `${limit}`;
    if (onlywritable) params.onlywritable = `${onlywritable}`;
    if (sort_by) params.sort_by = `${sort_by}`;
    if (sort_direction) params.sort_direction = `${sort_direction}`;
    if (additional?.length) params.additional = `${additional}`;
    return this._do(HttpMethod.POST, params);
  }

  listFile(
    folder_path: string,
    offset?: number,
    limit?: number,
    filetype?: 'file' | 'dir' | 'all',
    additional?: FileListOption[],
    sort_by?: FileSortBy,
    sort_direction?: 'asc' | 'dsc',
    pattern?: string,
    goto_path?: string
  ): Observable<FileList> {
    const params: HttpParameters = { method: FileMethod.list, folder_path };
    if (offset) if (offset) params.offset = `${offset}`;
    if (limit) params.limit = `${limit}`;
    if (sort_by) params.sort_by = `${sort_by}`;
    if (sort_direction) params.sort_direction = `${sort_direction}`;
    if (pattern) params.pattern = `${pattern}`;
    if (filetype) params.filetype = `${filetype}`;
    if (goto_path) params.pattern = `${goto_path}`;
    if (additional?.length) params.additional = `${additional}`;
    return this._do(HttpMethod.POST, params);
  }
}
