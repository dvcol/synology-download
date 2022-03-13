import { File } from '@src/models/file.model';

export interface FolderList {
  total: number;
  offset: number;
  shares?: Folder[];
}

export interface NewFolderList {
  folders?: File[];
}

/**
 * Specify which file information to sort on.
 */
export enum FolderSortBy {
  name = 'name',
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
}

export interface Folder {
  isdir: boolean;
  name: string;
  path: string;
  additional?: FolderAdditional;
}

export interface FolderAdditional {
  real_path: string;
  owner?: FolderOwner;
  /** Real path of a shared folder in a volume space. */
  time?: FolderTime;
  /** Folder permission information. */
  perm?: FolderPermission;
  mount_point_type: string;
  volume_status?: FolderVolumeStatus;
}

export enum FolderListOption {
  real_path = 'real_path',
  owner = 'owner',
  time = 'time',
  perm = 'perm',
  mount_point_type = 'mount_point_type',
  volume_status = 'volume_status',
}

export interface FolderOwner {
  /** File GID. */
  gid: number;
  /** Group name of file group. */
  group: string;
  /** File UID. */
  uid: number;
  /** User name of file owner. */
  user: string;
}

/**
 * Note: Linux timestamp in second, defined as the number of seconds that have elapsed since 00:00:00.
 * Coordinated Universal Time (UTC), Thursday, 1 January 1970.
 */
export interface FolderTime {
  /** Last access time */
  atime: number;
  /** Last modified time */
  mtime: number;
  /** Last change time */
  ctime: number;
  /** Creation time */
  crtime: number;
}

export enum FolderRight {
  /** "RW": The shared folder is writable */
  RW = 'RW',
  /** "RO": the shared folder is read-only. */
  RO = 'RO',
}

export interface FolderPermission {
  share_right: FolderRight;
  /** POSIX file permission, For example, 777 means owner, group or other has all permission; 764 means owner has all permission, group has read/write permission, other has read permission */
  posix: number;
  adv_right?: FolderPermissionAdvanced;
  /** If Windows ACL privilege of the shared folder is enabled or not. */
  acl_enabled: boolean;
  /** true : The privilege of the shared folder is set to be ACL-mode. false : The privilege of the shared folder is set to be POSIX-mode.
   */
  is_acl_mode: boolean;
  acl?: FolderAcl;
}

export interface FolderPermissionAdvanced {
  /**  If a non-administrator user can download files in this shared folder through SYNO.FileStation.Download API or not.*/
  disable_download: boolean;
  /** If a non-administrator user can enumerate files in this shared folder though SYNO.FileStation.List API with list method or not. */
  disable_list: boolean;
  /** If a non-administrator user can modify or overwrite files in this shared folder or not. */
  disable_modify: boolean;
}

/**
 * Windows ACL privilege. If a shared folder is set to be POSIX-mode, these values of Windows ACL privileges are derived from the POSIX privilege.
 */
export interface FolderAcl {
  /** If a logged-in user has a privilege to append data or create folders within this folder or not. */
  append: boolean;
  /** If a logged-in user has a privilege to delete a file/a folder within this folder or not. */
  del: boolean;
  /** If a logged-in user has a privilege to execute files/traverse folders within this folder or not. */
  exec: boolean;
  /** If a logged-in user has a privilege to read data or list folder within this folder or not. */
  read: boolean;
  /** If a logged-in user has a privilege to write data or create files within this folder or not. */
  write: boolean;
}

export interface FolderVolumeStatus {
  /** Byte size of free space of a volume where a shared folder is located. */
  freespace: number;
  /** Byte size of total space of a volume where a shared folder is located.  */
  totalspace: number;
  /** true : A volume where a shared folder is located is readonly; false : It's writable. */
  readonly: boolean;
}
