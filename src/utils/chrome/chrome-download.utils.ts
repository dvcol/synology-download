import { filter, fromEventPattern, map, merge, switchMap } from 'rxjs';

import type { Download, DownloadDelta, DownloadItem, DownloadStatus } from '@src/models';
import { DownloadService } from '@src/services';

import type { Observable } from 'rxjs';

const { search, pause, getFileIcon, resume, cancel, download, open, show, showDefaultFolder, erase, onCreated, onChanged } = chrome.downloads;

export { search, pause, getFileIcon, resume, cancel, download, open, show, showDefaultFolder, erase, onCreated, onChanged };

const addCreatedHandler = (handler: (downloadItem: DownloadItem) => void) => onCreated.addListener(handler);
const removeCreatedHandler = (handler: (downloadItem: DownloadItem) => void) => onCreated.removeListener(handler);
export const onCreated$: Observable<DownloadItem> = fromEventPattern<DownloadItem>(addCreatedHandler, removeCreatedHandler);

const addChangedHandler = (handler: (downloadDelta: DownloadDelta) => void) => onChanged.addListener(handler);
const removeChangedHandler = (handler: (downloadDelta: DownloadDelta) => void) => onChanged.removeListener(handler);
export const onChanged$: Observable<DownloadDelta> = fromEventPattern<DownloadDelta>(addChangedHandler, removeChangedHandler);

const onDownloadChange$: Observable<number> = merge(onCreated$.pipe(map(item => item.id)), onChanged$.pipe(map(item => item.id)));

const mapIdToDownload = (source: Observable<number>): Observable<Download> =>
  source.pipe(
    switchMap(id => DownloadService.search({ id })),
    map(downloads => downloads?.[0]),
  );
export const onDownloadCreated$: Observable<Download> = onCreated$.pipe(
  map(({ id }) => id),
  mapIdToDownload,
);
export const onStatus$ = (...statuses: DownloadStatus[]): Observable<Download> =>
  onDownloadChange$.pipe(
    mapIdToDownload,
    filter(item => !statuses?.length || statuses?.includes(item.status)),
  );
