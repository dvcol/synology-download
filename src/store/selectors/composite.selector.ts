import type { Content, ContentCount } from '../../models/content.model';
import type { Download } from '../../models/download.model';
import type { NotificationsBanner, NotificationsCount, NotificationsSnack, PollingSettings } from '../../models/settings.model';
import type { ContentTab, Tab, TabCount } from '../../models/tab.model';
import type { Task, TaskStatistics } from '../../models/task.model';
import type { StoreState } from '../store';

import { createSelector } from '@reduxjs/toolkit';

import { ContentStatusType } from '../../models/content.model';
import { ActionScope, defaultPolling } from '../../models/settings.model';
import { ContentTabSort } from '../../models/tab.model';
import { nullSafeCompare, numberCompare, stringCompare } from '../../utils/webex.utils';
import { getActiveDownloadIds, getDownloadingDownloadIds, getDownloads, getDownloadsIdsByStatusTypeReducer, getFinishedDownloadIds, getPausedDownloadIds } from './downloads.selector';
import { getTab } from './navbar.selector';
import { getActionScope, getNotificationsBanner, getNotificationsCount, getNotificationsSnack, getPolling, getSettingsDownloadsEnabled, getTabs } from './settings.selector';
import { isModalOpen } from './state.selector';
import { getActiveTasksIds, geTasksIdsByStatusTypeReducer, getErrorTasksIds, getFinishedTasksIds, getPausedTasksIds, getStats, getTasksArray, getTasksIds, getWaitingTasksIds } from './tasks.selector';

export const getTabOrFirst: (state: StoreState) => ContentTab | undefined = createSelector(getTab, getTabs, (tab?: ContentTab, tabs?: ContentTab[]) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getPollingInterval: (state: StoreState) => number = createSelector(isModalOpen, getPolling, (open: boolean, polling: PollingSettings) =>
  open
    ? (polling?.popup?.interval ?? defaultPolling.popup.interval)
    : (polling?.background?.interval ?? defaultPolling.background.interval));

export const getPollingEnabled: (state: StoreState) => boolean = createSelector(
  getPolling,
  isModalOpen,
  ({ enabled, popup, background }: PollingSettings, open: boolean) => enabled && (open ? popup?.enabled : background?.enabled),
);

export const getNotificationsBannerEnabled: (state: StoreState) => boolean = createSelector(
  getNotificationsBanner,
  isModalOpen,
  ({ enabled, scope }: NotificationsBanner, open: boolean) => enabled && (open ? scope?.popup : scope?.background),
);

export const getNotificationsSnackEnabled: (state: StoreState) => boolean = createSelector(
  getNotificationsSnack,
  isModalOpen,
  ({ enabled, scope }: NotificationsSnack, open: boolean) => enabled && (open ? scope?.popup : scope?.content),
);

function doSort<T extends Content>(items: T[], tab: ContentTab): T[] {
  switch (tab.sort) {
    case ContentTabSort.creation:
      return [...items].sort(nullSafeCompare((a, b) => numberCompare(a.createdAt, b.createdAt), tab.reverse));
    case ContentTabSort.destination:
      return [...items].sort(nullSafeCompare((a, b) => stringCompare(a.folder, b.folder), tab.reverse));
    case ContentTabSort.speed:
      return [...items].sort(nullSafeCompare((a, b) => numberCompare(a.speed, b.speed), tab.reverse));
    case ContentTabSort.size:
      return [...items].sort(nullSafeCompare((a, b) => numberCompare(a.size, b.size), tab.reverse));
    case ContentTabSort.status:
      return [...items].sort(nullSafeCompare((a, b) => stringCompare(a.status, b.status), tab.reverse));
    case ContentTabSort.title:
      return [...items].sort(nullSafeCompare((a, b) => stringCompare(a.title, b.title), tab.reverse));
    case ContentTabSort.progress:
      return [...items].sort(nullSafeCompare((a, b) => numberCompare(a.progress, b.progress), tab.reverse));
    case undefined:
    default:
      return items;
  }
}

function doFilter<T extends Content>(items?: T[], tab?: Tab): T[] {
  return items?.length && (tab?.status?.length || tab?.destination)
    ? items.filter((item) => {
        let result = true;
        if (tab?.status?.length) {
          result = result && tab?.status?.includes(item.status);
        }
        if (tab?.destination?.enabled && tab?.destination?.folder) {
          result = result && tab?.destination?.folder === item.folder;
        }
        return result;
      })
    : items ?? [];
}

export const getContents: (state: StoreState) => Content[] = createSelector(getTasksArray, getDownloads, getSettingsDownloadsEnabled, (tasks, contents, downloadEnabled) =>
  downloadEnabled ? [...tasks, ...contents] : tasks);
export const getContentsByTabId: (state: StoreState) => Record<string, Content[]> = createSelector(getContents, getTabs, (contents: Content[], tabs: ContentTab[]) =>
  tabs?.reduce((acc, tab) => {
    acc[tab.id] = doSort(doFilter(contents, tab), tab);
    return acc;
  }, {} as Record<string, Content[]>));

export const getContentsCountByTabId: (state: StoreState) => TabCount = createSelector(getContentsByTabId, getTabs, (contents: Record<string, Content[]>, tabs: ContentTab[]) =>
  contents && tabs
    ? tabs?.reduce((acc, tab) => {
        acc[tab.name] = contents[tab.id]?.length ?? 0;
        return acc;
      }, {} as TabCount)
    : {});

export const getBadgeCount: (state: StoreState) => number = createSelector(getContents, getNotificationsCount, (contents: Content[], count: NotificationsCount) =>
  contents?.length ? doFilter(contents, count)?.length ?? 0 : 0);

export const getCount: (state: StoreState) => ContentCount | undefined = createSelector(
  getContents,
  getBadgeCount,
  getContentsCountByTabId,
  getNotificationsCount,
  (contents: Content[], badge: number, tabs: TabCount, { enabled }: NotificationsCount) =>
    enabled ? { badge, total: contents?.length ?? 0, tabs } : undefined,
);

export const getStateBadge: (state: StoreState) => { count?: ContentCount; stats?: TaskStatistics } = createSelector(getCount, getStats, (count?: ContentCount, stats?: TaskStatistics) => ({ count, stats }));

export const getContentsForActiveTab: (state: StoreState) => Content[] = createSelector(getContentsByTabId, getTab, (contents: Record<string, Content[]>, tab?: ContentTab) =>
  contents && tab ? contents[tab.id] : []);

const geTasksIdsByStatusTypeForActiveTab = createSelector(getContentsForActiveTab, geTasksIdsByStatusTypeReducer);

const getTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.all]);
const getErrorTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.error]);
const getPausedTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.paused]);
const getActiveTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.active]);
const getWaitingTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.waiting]);
const getFinishedTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.finished]);

function taskActionScopeReducer(tasks: Set<Task['id']>, activeTasks: Set<Task['id']>, scope: ActionScope) {
  return ActionScope.all === scope ? tasks : activeTasks;
}

export const getTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(getTasksIds, getTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getErrorTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(getErrorTasksIds, getErrorTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getPausedTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(
  getPausedTasksIds,
  getPausedTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

const getActiveTasksIdsByActionScope = createSelector(getActiveTasksIds, getActiveTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getWaitingTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(
  getWaitingTasksIds,
  getWaitingTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

export const getActiveAndWaitingTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(
  getWaitingTasksIdsByActionScope,
  getActiveTasksIdsByActionScope,
  (waiting, active) => new Set([...waiting, ...active]),
);

export const getFinishedTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(
  getFinishedTasksIds,
  getFinishedTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

export const getFinishedAnErrorTasksIdsByActionScope: (state: StoreState) => Set<Task['id']> = createSelector(
  getFinishedTasksIdsByActionScope,
  getErrorTasksIdsByActionScope,
  (finished, errors) => new Set([...finished, ...errors]),
);

const geDownloadsIdsByStatusTypeForActiveTab = createSelector(getContentsForActiveTab, getDownloadsIdsByStatusTypeReducer);

const getActiveDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.active]);
const getFinishedDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.finished]);
const getDownloadingDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.downloading]);
const getPausedDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.paused]);

function downloadActionScopeReducer(tasks: Set<Download['id']>, activeTasks: Set<Download['id']>, scope: ActionScope) {
  return Array.from(ActionScope.all === scope ? tasks : activeTasks);
}

export const getActiveDownloadIdsByActionScope: (state: StoreState) => Download['id'][] = createSelector(
  getActiveDownloadIds,
  getActiveDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getFinishedDownloadIdsByActionScope: (state: StoreState) => Download['id'][] = createSelector(
  getFinishedDownloadIds,
  getFinishedDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getDownloadingDownloadIdsByActionScope: (state: StoreState) => Download['id'][] = createSelector(
  getDownloadingDownloadIds,
  getDownloadingDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getPausedDownloadIdsByActionScope: (state: StoreState) => Download['id'][] = createSelector(
  getPausedDownloadIds,
  getPausedDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
