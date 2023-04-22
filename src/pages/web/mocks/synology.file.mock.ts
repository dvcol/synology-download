import type { File, FileAdditional } from '@src/models';

import { FetchIntercept } from '../models';

import { AbstractMock, resolveUrl } from './utils.mock';

type FileEntities = { shares: Record<string, File>; files: Record<string, File> };

const additional: FileAdditional = {
  perm: {
    acl: { append: true, del: true, exec: true, read: true, write: true },
    is_acl_mode: true,
    posix: 700,
  },
};

const defaultFiles: FileEntities = {
  shares: {
    Books: { isdir: true, name: 'Books', path: '/Books' },
    Music: { isdir: true, name: 'Music', path: '/Music' },
    Video: { isdir: true, name: 'Video', path: '/Video' },
    Documents: { isdir: true, name: 'Documents', path: '/Documents' },
    Downloads: { isdir: true, name: 'Downloads', path: '/Downloads' },
  },
  files: {
    '/Downloads/pdf': { isdir: true, name: 'pdf', path: '/Downloads/pdf', additional },
    '/Downloads/iso': { isdir: true, name: 'iso', path: '/Downloads/iso', additional },
    '/Downloads/bin': { isdir: true, name: 'bin', path: '/Downloads/bin', additional },
  },
};

const storageKey = 'synology.mock.file';

const getFiles = (): FileEntities => {
  const storage = localStorage.getItem(storageKey);
  if (storage) return JSON.parse(storage);
  localStorage.setItem(storageKey, JSON.stringify(defaultFiles));
  return defaultFiles;
};

export class FileMock extends AbstractMock<FileEntities> {
  readonly key = storageKey;

  constructor(entities: Partial<FileEntities> = getFiles()) {
    super({ shares: {}, files: {}, ...entities });
  }

  get shares(): File[] {
    return Object.values(this.entities.shares);
  }

  ids(key: keyof FileEntities): string[] {
    return Object.keys(this.entities[key]);
  }

  length(key: keyof FileEntities): number {
    return this.ids(key).length;
  }

  files(path?: string): File[] {
    if (!path) return [];
    return Object.values(this.entities.files).filter(f => f.path?.substring(0, f.path.lastIndexOf('/')) === path);
  }

  addShare(file: File) {
    this.entities.shares[file.name] = file;
    super.publish();
    return this.shares;
  }

  add(file: File) {
    this.entities.files[file.path] = { additional, ...file };
    super.publish();
    return this.files;
  }

  rename(path: string, name: string) {
    const file = this.entities.files[path];
    if (file) {
      file.name = name;
      file.path = `${path.substring(0, path.lastIndexOf('/'))}/${name}`;
      this.add(file);
      setTimeout(() => delete this.entities.files[path]);

      Object.keys(this.entities.files).forEach(_path => {
        if (_path.startsWith(`${path}/`)) {
          this.add({ ...this.entities.files[_path], path: _path.replace(path, file.path) });
          delete this.entities.files[_path];
        }
      });
    }
    super.publish();
    return this.entities.files[path];
  }
}

export const patchFiles = (_global = window): FileMock => {
  if (!_global._synology) _global._synology = {};
  if (!_global._synology.mock) _global._synology.mock = {};
  if (!_global._synology.mock.file) _global._synology.mock.file = new FileMock();
  const { file } = _global._synology.mock;

  if (!_global._fetchIntercept) _global._fetchIntercept = new FetchIntercept();

  // list shared
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('entry.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.FileStation.List&method=list_share');
    },
    () => ({ offset: 0, shares: file.shares, total: 1 }),
  ]);

  // list files
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('entry.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.FileStation.List&method=list');
    },
    (_, init) => {
      let path = init?.body?.toString()?.match(/folder_path=(.*?(?=&|$))/)?.[1];
      if (path) path = decodeURIComponent(path);
      return { offset: 0, files: file.files(path), total: 1 };
    },
  ]);

  // create folder
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('entry.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.FileStation.CreateFolder&method=create');
    },
    (_, init) => {
      let path = init?.body?.toString()?.match(/folder_path=%5B%22(.*?(?=&|$|%22%5D))%22%5D/)?.[1];
      let name = init?.body?.toString()?.match(/name=%5B%22(.*?(?=&|$|%22%5D))%22%5D/)?.[1];
      if (path && name) {
        path = decodeURIComponent(path);
        name = decodeURIComponent(name);
        const _file: File = { isdir: true, name, path: [path, name].join('/') };
        file.add(_file);
        return { offset: 0, folders: [_file], total: 1 };
      }
      return { offset: 0, folders: [], total: 0 };
    },
  ]);

  // rename folder
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('entry.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.FileStation.Rename&method=rename');
    },
    (_, init) => {
      const path = init?.body?.toString()?.match(/path=%5B%22(.*?(?=&|$|%22%5D))%22%5D/)?.[1];
      const name = init?.body?.toString()?.match(/name=%5B%22(.*?(?=&|$|%22%5D))%22%5D/)?.[1];
      if (path && name) {
        const _file = file.rename(decodeURIComponent(path), decodeURIComponent(name));
        return { offset: 0, files: [_file], total: 1 };
      }
      return { offset: 0, files: [], total: 0 };
    },
  ]);

  return file;
};
