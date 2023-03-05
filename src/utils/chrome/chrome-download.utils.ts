import { filter, map, merge, switchMap } from 'rxjs';

import type {
  DownloadFilenameSuggestion as _DownloadFilenameSuggestion,
  DownloadItem as _DownloadItem,
  DownloadOptions as _DownloadOptions,
  DownloadQuery as _DownloadQuery,
  InstalledDetails as _InstalledDetails,
} from '@dvcol/web-extension-utils';
import { onChanged$, onCreated$, onFilename$ as _onFilename$ } from '@dvcol/web-extension-utils';

import type { Download, DownloadStatus } from '@src/models';
import { DownloadService } from '@src/services';

import type { Observable } from 'rxjs';

export const {
  search,
  pause,
  getFileIcon,
  resume,
  cancel,
  download,
  open,
  show,
  showDefaultFolder,
  erase,
  onCreated,
  onChanged,
  onDeterminingFilename,
} = chrome?.downloads ?? {};

export type DownloadOptions = _DownloadOptions;
export type DownloadQuery = _DownloadQuery;
export type DownloadItem = _DownloadItem;
export type DownloadFilenameSuggestion = _DownloadFilenameSuggestion;
export type InstalledDetails = _InstalledDetails;

export const onFilename$: Observable<[DownloadItem, (suggestion?: DownloadFilenameSuggestion) => void]> = _onFilename$;

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
