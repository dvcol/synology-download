import type { FileList, FileListOption, FileSortBy, FolderList, FolderListOption, FolderSortBy, NewFolderList } from '@src/models';
import { Endpoint, FileMethod, FileStationAPI } from '@src/models';
import { SynologyService } from '@src/services/http';
import { HttpMethod } from '@src/utils';
import type { HttpParameters } from '@src/utils';

import type { Observable } from 'rxjs';

export class SynologyFileService extends SynologyService {
  constructor(protected isProxy = false, protected name: string = 'SynologyFileService') {
    super(isProxy, name);
  }

  _do<T>(method: HttpMethod, params: HttpParameters, version = '2', api = FileStationAPI.List, endpoint = Endpoint.Entry): Observable<T> {
    return super.do<T>({ method, params, version, api, endpoint });
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
    additional?: FolderListOption[],
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
    goto_path?: string,
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

  /**
   * Create a folder named 'name' at path 'folder_path'
   * @param folder_path One or more shared folder paths, separated by commas and around brackets.
   *                    If force_parent is "true," and folder_path does not exist, the folder_path will be created.
   *                    If force_parent is "false," folder_path must exist or a false value will be returned.
   *                    The number of paths must be the same as the number of names in the name parameter.
   *                    The first folder_path parameter corresponds to the first name parameter
   * @param name  One or more new folder names, separated by commas "," and around brackets.
   *              The number of names must be the same as the number of folder paths in the folder_path parameter.
   *              The first name parameter corresponding to the first folder_path parameter.
   * @param force_parent  Optional.
   *                      true : no error occurs if a folder exists and create parent folders as needed.
   *                      false : parent folders are not created.
   * @param additional
   */
  createFolder(
    folder_path: string | string[],
    name: string | string[],
    force_parent = false,
    additional?: FileListOption[],
  ): Observable<NewFolderList> {
    const params: HttpParameters = { method: FileMethod.create };
    if (folder_path) {
      const folders = (Array.isArray(folder_path) ? folder_path : [folder_path])?.map(folder => (folder.charAt(0) === '/' ? folder : `/${folder}`));
      params.folder_path = `["${folders?.join('","')}"]`;
    }
    if (name) params.name = `["${Array.isArray(name) ? name.join('","') : name}"]`;
    if (force_parent) params.force_parent = `${force_parent}`;
    if (additional?.length) params.additional = `${additional}`;
    return this._do(HttpMethod.POST, params, '2', FileStationAPI.CreateFolder);
  }

  /**
   *
   * @param path  One or more paths of files/folders to be renamed, separated by commas "," and around brackets.
   *              The number of paths must be the same as the number of names in the name parameter.
   *              The first path parameter corresponds to the first name parameter.
   * @param name  One or more new names, separated by commas "," and around brackets.
   *              The number of names must be the same as the number of folder paths in the path parameter.
   *              The first name parameter corresponding to the first path parameter.
   * @param search_taskid Optional.
   *                      A unique ID for the search task which is obtained from start method.
   *                      It is used to update the renamed file in the search result.
   * @param additional
   */
  renameFolder(path: string | string[], name: string | string[], additional?: FileListOption[], search_taskid?: string): Observable<FileList> {
    const params: HttpParameters = { method: FileMethod.rename };
    if (path) {
      const folders = (Array.isArray(path) ? path : [path])?.map(folder => (folder.charAt(0) === '/' ? folder : `/${folder}`));
      params.path = `["${folders?.join('","')}"]`;
    }
    if (name) params.name = `["${Array.isArray(name) ? name.join('","') : name}"]`;
    if (additional?.length) params.additional = `${additional}`;
    if (search_taskid) params.search_taskid = `${search_taskid}`;
    return this._do(HttpMethod.POST, params, '2', FileStationAPI.Rename);
  }
}
