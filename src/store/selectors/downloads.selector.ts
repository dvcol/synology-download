import type { Content, ContentStatusTypeId } from '../../models/content.model';
import type { Download } from '../../models/download.model';
import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';

import { ContentSource, ContentStatusType } from '../../models/content.model';
import { DownloadStatus } from '../../models/download.model';

export const getDownloads: (state: StoreState) => StoreState['downloads']['entities'] = createSelector(
  (state: StoreState) => state,
  state => state.downloads.entities,
);

export function getDownloadsIdsByStatusTypeReducer(items: Content[]) {
  return items
    ?.filter(item => item.source === ContentSource.Download)
    ?.map(item => item as Download)
    .reduce(
      (map, { id, status, canResume }) => {
        if ([DownloadStatus.downloading, DownloadStatus.paused].includes(status)) {
          map[ContentStatusType.active].add(id);
        } else {
          map[ContentStatusType.finished].add(id);
        }

        if (DownloadStatus.downloading === status) {
          map[ContentStatusType.downloading].add(id);
        } else if (canResume) {
          map[ContentStatusType.paused].add(id);
        }

        map[ContentStatusType.all].add(id);
        return map;
      },
      Object.values(ContentStatusType).reduce((acc, type) => {
        acc[type] = new Set<Download['id']>();
        return acc;
      }, {} as ContentStatusTypeId<Download['id']>),
    );
}

const getDownloadsIdsByStatusType = createSelector(getDownloads, getDownloadsIdsByStatusTypeReducer);

export const getActiveDownloadIds: (state: StoreState) => Set<Download['id']> = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.active]);
export const getFinishedDownloadIds: (state: StoreState) => Set<Download['id']> = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.finished]);
export const getDownloadingDownloadIds: (state: StoreState) => Set<Download['id']> = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.downloading]);
export const getPausedDownloadIds: (state: StoreState) => Set<Download['id']> = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.paused]);
