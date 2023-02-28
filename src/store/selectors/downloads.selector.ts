import { createSelector } from '@reduxjs/toolkit';

import type { Content, ContentStatusTypeId, Download } from '@src/models';
import { ContentSource, ContentStatusType, DownloadStatus } from '@src/models';

import type { StoreState } from '../store';

export const getDownloads = createSelector(
  (state: StoreState) => state,
  state => state.downloads.entities,
);

export const getDownloadsIdsByStatusTypeReducer = (items: Content[]) =>
  items
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

const getDownloadsIdsByStatusType = createSelector(getDownloads, getDownloadsIdsByStatusTypeReducer);

export const getActiveDownloadIds = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.active]);
export const getFinishedDownloadIds = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.finished]);
export const getDownloadingDownloadIds = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.downloading]);
export const getPausedDownloadIds = createSelector(getDownloadsIdsByStatusType, map => map[ContentStatusType.paused]);
