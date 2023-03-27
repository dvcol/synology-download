import { createSelector } from '@reduxjs/toolkit';

import type {
  Content,
  ContentCount,
  ContentTab,
  Download,
  NotificationsBanner,
  NotificationsCount,
  NotificationsSnack,
  PollingSettings,
  Tab,
  TabCount,
  Task,
  TaskStatistics,
} from '@src/models';
import { ActionScope, ContentStatusType, ContentTabSort } from '@src/models';
import {
  getActionScope,
  getActiveDownloadIds,
  getActiveTasksIds,
  geTasksIdsByStatusTypeReducer,
  getDownloadingDownloadIds,
  getDownloads,
  getDownloadsIdsByStatusTypeReducer,
  getErrorTasksIds,
  getFinishedDownloadIds,
  getFinishedTasksIds,
  getNotificationsBanner,
  getNotificationsCount,
  getNotificationsSnack,
  getPausedDownloadIds,
  getPausedTasksIds,
  getPolling,
  getSettingsDownloadsEnabled,
  getStats,
  getTab,
  getTabs,
  getTasksArray,
  getTasksIds,
  getWaitingTasksIds,
  isModalOpen,
} from '@src/store/selectors';
import { nullSafeCompare, numberCompare, stringCompare } from '@src/utils';

export const getTabOrFirst = createSelector(getTab, getTabs, (tab?: ContentTab, tabs?: ContentTab[]) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getPollingInterval = createSelector(isModalOpen, getPolling, (open: boolean, polling: PollingSettings) =>
  open ? polling?.popup?.interval : polling?.background?.interval,
);

export const getPollingEnabled = createSelector(
  getPolling,
  isModalOpen,
  ({ enabled, popup, background }: PollingSettings, open: boolean) => enabled && (open ? popup?.enabled : background?.enabled),
);

export const getNotificationsBannerEnabled = createSelector(
  getNotificationsBanner,
  isModalOpen,
  ({ enabled, scope }: NotificationsBanner, open: boolean) => enabled && (open ? scope?.popup : scope?.background),
);

export const getNotificationsSnackEnabled = createSelector(
  getNotificationsSnack,
  isModalOpen,
  ({ enabled, scope }: NotificationsSnack, open: boolean) => enabled && (open ? scope?.popup : scope?.content),
);

const doSort = <T extends Content>(items: T[], tab: ContentTab): T[] => {
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
    default:
      return items;
  }
};

const doFilter = <T extends Content>(items?: T[], tab?: Tab): T[] =>
  items?.length && (tab?.status?.length || tab?.destination)
    ? items.filter(item => {
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

export const getContents = createSelector(getTasksArray, getDownloads, getSettingsDownloadsEnabled, (tasks, contents, downloadEnabled) =>
  downloadEnabled ? [...tasks, ...contents] : tasks,
);
export const getContentsByTabId = createSelector(getContents, getTabs, (contents: Content[], tabs: ContentTab[]) =>
  tabs?.reduce((acc, tab) => {
    acc[tab.id] = doSort(doFilter(contents, tab), tab);
    return acc;
  }, {} as Record<string, Content[]>),
);

export const getContentsCountByTabId = createSelector(getContentsByTabId, getTabs, (contents: Record<string, Content[]>, tabs: ContentTab[]) =>
  contents && tabs
    ? tabs?.reduce((acc, tab) => {
        acc[tab.name] = contents[tab.id]?.length ?? 0;
        return acc;
      }, {} as TabCount)
    : {},
);

export const getBadgeCount = createSelector(getContents, getNotificationsCount, (contents: Content[], count: NotificationsCount) =>
  contents?.length ? doFilter(contents, count)?.length ?? 0 : 0,
);

export const getCount = createSelector(
  getContents,
  getBadgeCount,
  getContentsCountByTabId,
  getNotificationsCount,
  (contents: Content[], badge: number, tabs: TabCount, { enabled }: NotificationsCount) =>
    enabled ? { badge, total: contents?.length ?? 0, tabs } : undefined,
);

export const getStateBadge = createSelector(getCount, getStats, (count?: ContentCount, stats?: TaskStatistics) => ({ count, stats }));

export const getContentsForActiveTab = createSelector(getContentsByTabId, getTab, (contents: Record<string, Content[]>, tab?: ContentTab) =>
  contents && tab ? contents[tab.id] : [],
);

const geTasksIdsByStatusTypeForActiveTab = createSelector(getContentsForActiveTab, geTasksIdsByStatusTypeReducer);

const getTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.all]);
const getErrorTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.error]);
const getPausedTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.paused]);
const getActiveTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.active]);
const getWaitingTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.waiting]);
const getFinishedTasksIdsForActiveTab = createSelector(geTasksIdsByStatusTypeForActiveTab, map => map[ContentStatusType.finished]);

const taskActionScopeReducer = (tasks: Set<Task['id']>, activeTasks: Set<Task['id']>, scope: ActionScope) =>
  ActionScope.all === scope ? tasks : activeTasks;

export const getTasksIdsByActionScope = createSelector(getTasksIds, getTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getErrorTasksIdsByActionScope = createSelector(getErrorTasksIds, getErrorTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getPausedTasksIdsByActionScope = createSelector(
  getPausedTasksIds,
  getPausedTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

const getActiveTasksIdsByActionScope = createSelector(getActiveTasksIds, getActiveTasksIdsForActiveTab, getActionScope, taskActionScopeReducer);

export const getWaitingTasksIdsByActionScope = createSelector(
  getWaitingTasksIds,
  getWaitingTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

export const getActiveAndWaitingTasksIdsByActionScope = createSelector(
  getWaitingTasksIdsByActionScope,
  getActiveTasksIdsByActionScope,
  (waiting, active) => new Set([...waiting, ...active]),
);

export const getFinishedTasksIdsByActionScope = createSelector(
  getFinishedTasksIds,
  getFinishedTasksIdsForActiveTab,
  getActionScope,
  taskActionScopeReducer,
);

export const getFinishedAnErrorTasksIdsByActionScope = createSelector(
  getFinishedTasksIdsByActionScope,
  getErrorTasksIdsByActionScope,
  (finished, errors) => new Set([...finished, ...errors]),
);

const geDownloadsIdsByStatusTypeForActiveTab = createSelector(getContentsForActiveTab, getDownloadsIdsByStatusTypeReducer);

const getActiveDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.active]);
const getFinishedDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.finished]);
const getDownloadingDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.downloading]);
const getPausedDownloadIdsForActiveTab = createSelector(geDownloadsIdsByStatusTypeForActiveTab, map => map[ContentStatusType.paused]);

const downloadActionScopeReducer = (tasks: Set<Download['id']>, activeTasks: Set<Download['id']>, scope: ActionScope) =>
  Array.from(ActionScope.all === scope ? tasks : activeTasks);

export const getActiveDownloadIdsByActionScope = createSelector(
  getActiveDownloadIds,
  getActiveDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getFinishedDownloadIdsByActionScope = createSelector(
  getFinishedDownloadIds,
  getFinishedDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getDownloadingDownloadIdsByActionScope = createSelector(
  getDownloadingDownloadIds,
  getDownloadingDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
export const getPausedDownloadIdsByActionScope = createSelector(
  getPausedDownloadIds,
  getPausedDownloadIdsForActiveTab,
  getActionScope,
  downloadActionScopeReducer,
);
