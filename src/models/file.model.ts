import type { FolderAcl, FolderOwner, FolderTime } from './folder.model';

export interface FileList {
  total: number;
  offset: number;
  files?: File[];
}

/**
 * Specify which file information to sort on.
 */
export enum FileSortBy {
  name = 'name',
  size = 'size',
  user = 'user',
  group = 'group',
  /** Last modified time */
  mtime = 'mtime',
  /** Last access time */
  atime = 'atime',
  /** Last change time */
  ctime = 'ctime',
  /** Creation time */
  crtime = 'crtime',
  /** POSIX permission */
  posix = 'posix',
  /** file extension */
  type = 'type',
}

export interface File {
  isdir: boolean;
  name: string;
  path: string;
  children?: FileList;
  additional?: FileAdditional;
}

export interface FileAdditional {
  real_path: string;
  size: number;
  owner?: FolderOwner;
  time?: FolderTime;
  /** File permission information. */
  perm?: FilePermission;
  mount_point_type: string;
  /** Real path of a shared folder in a volume space. */
  type: string;
}

export enum FileListOption {
  real_path = 'real_path',
  size = 'size',
  owner = 'owner',
  time = 'time',
  perm = 'perm',
  mount_point_type = 'mount_point_type',
  type = 'type',
}

export interface FilePermission {
  /** POSIX file permission, For example, 777 means owner, group or other has all permission; 764 means owner has all permission, group has read/write permission, other has read permission */
  posix: number;
  /** true : The privilege of the shared folder is set to be ACL-mode. false : The privilege of the shared folder is set to be POSIX-mode.
   */
  is_acl_mode: boolean;
  acl?: FolderAcl;
}
