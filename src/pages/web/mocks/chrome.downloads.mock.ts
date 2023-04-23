import { faker } from '@faker-js/faker/locale/en';

import { AbstractMock } from '@src/pages/web/mocks/utils.mock';
import { BaseLoggerService } from '@src/services';
import type { DownloadItem } from '@src/utils';

export const generateDownload = (_download: Partial<DownloadItem> = {}): DownloadItem => {
  const totalBytes = _download?.totalBytes ?? faker.datatype.number({ min: 1000, max: 1000000000 });
  const bytesReceived = _download?.bytesReceived ?? faker.datatype.number({ min: 0, max: totalBytes / 10 });

  const filename = faker.system.filePath();
  const url = `${faker.internet.url()}/${filename.split('/').pop()}`;

  const state = faker.helpers.arrayElement([...Array(8).fill('in_progress'), 'interrupted', 'complete']);

  return {
    totalBytes,
    bytesReceived,
    fileSize: totalBytes,
    state,
    paused: state === 'interrupted',
    canResume: state === 'interrupted',
    exists: state === 'complete' ? faker.datatype.boolean() : true,
    danger: faker.helpers.arrayElement(['file', 'url', 'content', 'uncommon', 'host', 'unwanted', 'safe', 'accepted']),
    id: faker.helpers.unique(faker.datatype.number),
    incognito: false,
    mime: faker.system.mimeType(),
    referrer: faker.internet.url(),
    startTime: new Date().toISOString(),
    estimatedEndTime: faker.date.soon(0).toISOString(),
    filename: faker.system.filePath(),
    finalUrl: url,
    url,
    ..._download,
  };
};

type DownloadEntities = Record<string, DownloadItem>;

const defaultDownloads: DownloadEntities = Array(5)
  .fill(undefined)
  .reduce(acc => {
    const _download = generateDownload();
    acc[_download.id] = _download;
    return acc;
  }, {});

const storageKey = 'synology.mock.download';

const getDownload = (): DownloadEntities => {
  const storage = localStorage.getItem(storageKey);
  if (storage) return JSON.parse(storage);
  localStorage.setItem(storageKey, JSON.stringify(defaultDownloads));
  return defaultDownloads;
};

export class DownloadMock extends AbstractMock<DownloadEntities> {
  readonly key = storageKey;

  constructor(entities = getDownload()) {
    super(entities);
  }

  get ids(): string[] {
    return Object.keys(this.entities);
  }

  get downloads(): DownloadItem[] {
    return Object.values(this.entities);
  }

  get length(): number {
    return this.ids.length;
  }

  add(download: DownloadItem = generateDownload()) {
    this.entities[download.id] = download;
    super.publish();
    return this.entities;
  }

  remove(id: DownloadItem['id']) {
    const result = delete this.entities[id];
    super.publish();
    return result;
  }

  pause(id: DownloadItem['id']) {
    this.entities[id].paused = true;
    this.entities[id].canResume = true;
    super.publish();
    return this.entities[id];
  }

  resume(id: DownloadItem['id']) {
    this.entities[id].exists = true;
    this.entities[id].paused = false;
    this.entities[id].error = undefined;
    this.entities[id].state = 'in_progress';
    this.entities[id].endTime = undefined;
    super.publish();
    return this.entities[id];
  }

  cancel(id: DownloadItem['id']) {
    this.entities[id].paused = false;
    this.entities[id].error = 'USER_CANCELED';
    this.entities[id].state = 'interrupted';
    this.entities[id].endTime = new Date().toISOString();
    super.publish();
    return this.entities[id];
  }
}

const generateError = (): DownloadItem['error'] =>
  faker.helpers.arrayElement([
    'FILE_FAILED',
    'FILE_ACCESS_DENIED',
    'FILE_NO_SPACE',
    'FILE_NAME_TOO_LONG',
    'FILE_TOO_LARGE',
    'FILE_VIRUS_INFECTED',
    'FILE_TRANSIENT_ERROR',
    'FILE_BLOCKED',
    'FILE_SECURITY_CHECK_FAILED',
    'FILE_TOO_SHORT',
    'FILE_HASH_MISMATCH',
    'FILE_SAME_AS_SOURCE',
    'NETWORK_FAILED',
    'NETWORK_TIMEOUT',
    'NETWORK_DISCONNECTED',
    'NETWORK_SERVER_DOWN',
    'NETWORK_INVALID_REQUEST',
    'SERVER_FAILED',
    'SERVER_NO_RANGE',
    'SERVER_BAD_CONTENT',
    'SERVER_UNAUTHORIZED',
    'SERVER_CERT_PROBLEM',
    'SERVER_FORBIDDEN',
    'SERVER_UNREACHABLE',
    'SERVER_CONTENT_LENGTH_MISMATCH',
    'SERVER_CROSS_ORIGIN_REDIRECT',
    'USER_CANCELED',
    'USER_SHUTDOWN',
    'CRASH',
  ]);

const fail = (download: DownloadItem) => {
  if (faker.datatype.number(100000) < 99999) return download;
  return {
    ...download,
    canResume: faker.datatype.boolean(),
    error: generateError(),
  };
};

const progress = (download: DownloadItem) => {
  const total = download.totalBytes ?? download.fileSize;
  const downloaded = download.bytesReceived;
  if (total / downloaded < 1.05) {
    download.state = 'complete';
    download.bytesReceived = total;
    download.endTime = new Date().toISOString();
    download.estimatedEndTime = faker.date.soon(0, download.estimatedEndTime).toISOString();
    return download;
  }
  if (faker.datatype.number(100) > 20) {
    const max = (total - downloaded) / faker.datatype.number({ min: 5, max: 500 });
    download.bytesReceived = downloaded + faker.datatype.number({ max });
  }
  return download;
};

const exists = (download: DownloadItem) => {
  if (faker.datatype.number(100000) < 80000) return download;
  return {
    ...download,
    exists: false,
  };
};

export const activateDownloadDemo = (download: DownloadMock, interval = 100) => {
  return setInterval(() => {
    download.downloads.forEach(_download => {
      switch (_download.state) {
        case 'in_progress':
          fail(_download);
          if (!_download.paused) progress(_download);
          break;
        case 'interrupted':
        case 'complete':
          exists(_download);
          break;
        default:
          break;
      }
    });
  }, interval);
};

export const patchDownloads = (_global = window) => {
  if (!_global._synology) _global._synology = {};
  if (!_global._synology.mock) _global._synology.mock = {};
  if (!_global._synology.mock.download) _global._synology.mock.download = new DownloadMock();
  const { download } = _global._synology.mock;

  _global.chrome.downloads.search = query => {
    BaseLoggerService.debug('chrome.downloads.search', query);
    return Promise.resolve(download?.downloads ?? []);
  };
  _global.chrome.downloads.erase = query => {
    BaseLoggerService.debug('chrome.downloads.erase', query);
    if (query.id) download?.remove(query.id);
    return Promise.resolve([query.id ?? 0]);
  };
  _global.chrome.downloads.download = query => {
    BaseLoggerService.debug('chrome.downloads.download', query);
    const { filename, url } = query;
    download?.add(generateDownload({ filename, url }));
    return Promise.resolve(0);
  };
  _global.chrome.downloads.pause = downloadId => {
    BaseLoggerService.debug('chrome.downloads.pause', downloadId);
    download?.pause(downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.resume = downloadId => {
    BaseLoggerService.debug('chrome.downloads.resume', downloadId);
    download?.resume(downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.cancel = downloadId => {
    BaseLoggerService.debug('chrome.downloads.cancel', downloadId);
    download?.cancel(downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.open = downloadId => {
    BaseLoggerService.debug('chrome.downloads.open', downloadId);
    return Promise.resolve();
  };
  return _global.chrome.downloads;
};
