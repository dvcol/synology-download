import { filter, fromEventPattern, map, merge, switchMap } from 'rxjs';

import type { Download, DownloadStatus } from '@src/models';
import { DownloadService } from '@src/services';

import type { Observable } from 'rxjs';

const { search, pause, getFileIcon, resume, cancel, download, open, show, showDefaultFolder, erase, onCreated, onChanged, onDeterminingFilename } =
  chrome?.downloads ?? {};

export { search, pause, getFileIcon, resume, cancel, download, open, show, showDefaultFolder, erase, onCreated, onChanged, onDeterminingFilename };

export type DownloadOptions = chrome.downloads.DownloadOptions;
export type DownloadQuery = chrome.downloads.DownloadQuery;
export type DownloadItem = chrome.downloads.DownloadItem;
export type DownloadState = chrome.downloads.DownloadState;
export type DownloadDelta = chrome.downloads.DownloadDelta;
export type DownloadFilenameSuggestion = chrome.downloads.DownloadFilenameSuggestion;

type FilenameHandler = (downloadItem: DownloadItem, suggest: (suggestion?: DownloadFilenameSuggestion) => void) => void;
const addFilenameHandler = (handler: FilenameHandler) =>
  onDeterminingFilename.addListener((...args) => {
    handler(...args);
    return true;
  });
const removeFilenameHandler = (handler: FilenameHandler) => onDeterminingFilename.removeListener(handler);
export const onFilename$: Observable<[DownloadItem, (suggestion?: DownloadFilenameSuggestion) => void]> = fromEventPattern<
  [DownloadItem, (suggestion?: DownloadFilenameSuggestion) => void]
>(addFilenameHandler, removeFilenameHandler);

type CreateHandler = (downloadItem: DownloadItem) => void;
const addCreatedHandler = (handler: CreateHandler) => onCreated.addListener(handler);
const removeCreatedHandler = (handler: CreateHandler) => onCreated.removeListener(handler);
const onCreated$: Observable<DownloadItem> = fromEventPattern<DownloadItem>(addCreatedHandler, removeCreatedHandler);

type ChangedHandler = (downloadDelta: DownloadDelta) => void;
const addChangedHandler = (handler: ChangedHandler) => onChanged.addListener(handler);
const removeChangedHandler = (handler: ChangedHandler) => onChanged.removeListener(handler);
const onChanged$: Observable<DownloadDelta> = fromEventPattern<DownloadDelta>(addChangedHandler, removeChangedHandler);

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
    filter(item => !statuses?.length || statuses?.includes(item?.status)),
  );
