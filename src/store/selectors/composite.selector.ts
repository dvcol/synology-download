import { createSelector } from '@reduxjs/toolkit';
import { Tab, TabCount, Task, TaskTab, TaskTabSort } from '@src/models';
import { getNotificationsBanner, getNotificationsCount, getPolling, getTab, getTabs, getTasks, isModalOpen } from '@src/store/selectors';

export const getTabOrFirst = createSelector(getTab, getTabs, (tab, tabs) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getPollingInterval = createSelector(isModalOpen, getPolling, (open, polling) =>
  open ? polling?.popup?.interval : polling?.background?.interval
);

export const getPollingEnabled = createSelector(
  getPolling,
  isModalOpen,
  ({ enabled, popup, background }, open) => enabled && (open ? popup?.enabled : background?.enabled)
);

export const getNotificationsBannerEnabled = createSelector(
  getNotificationsBanner,
  isModalOpen,
  ({ enabled, scope }, open) => enabled && (open ? scope?.popup : scope?.background)
);

const nullSafeCompare =
  <A, B>(compareFn: (a: A, b: B) => number, reverse = false) =>
  (a: A, b: B) => {
    let result;
    if (a == null && b == null) result = 0;
    else if (a == null) result = 1;
    else if (b == null) result = -1;
    else result = compareFn(a, b);
    return reverse ? -1 * result : result;
  };

const doSort = (tasks: Task[], tab: TaskTab): Task[] => {
  switch (tab.sort) {
    case TaskTabSort.creation:
      return [...tasks].sort(
        nullSafeCompare((a, b) => (a.additional?.detail?.create_time > b.additional?.detail?.create_time ? 1 : -1), tab.reverse)
      );
    case TaskTabSort.destination:
      return [...tasks].sort(
        nullSafeCompare((a, b) => a.additional?.detail?.destination?.localeCompare(b.additional?.detail?.destination), tab.reverse)
      );
    case TaskTabSort.speed:
      return [...tasks].sort(
        nullSafeCompare((a, b) => (a.additional?.transfer?.speed_download > b.additional?.transfer?.speed_download ? 1 : -1), tab.reverse)
      );
    case TaskTabSort.size:
      return [...tasks].sort(nullSafeCompare((a, b) => (a.size > b.size ? 1 : -1), tab.reverse));
    case TaskTabSort.status:
      return [...tasks].sort(nullSafeCompare((a, b) => a.status?.localeCompare(b.status), tab.reverse));
    case TaskTabSort.title:
      return [...tasks].sort(nullSafeCompare((a, b) => a.title?.localeCompare(b.title), tab.reverse));
    default:
      return tasks;
  }
};

const doFilter = (tasks?: Task[], tab?: Tab): Task[] =>
  tasks?.length && (tab?.status?.length || tab?.destination)
    ? tasks.filter((t) => {
        let result = true;
        if (tab?.status?.length) {
          result = result && tab?.status?.includes(t.status);
        }
        if (tab?.destination?.enabled && tab?.destination?.folder) {
          result = result && tab?.destination?.folder === t.additional?.detail?.destination;
        }
        return result;
      })
    : tasks ?? [];

export const getFilteredTasks = createSelector(getTasks, getTabs, (tasks, tabs) =>
  tabs?.reduce((acc, tab) => {
    acc[tab.id] = doSort(doFilter(tasks, tab), tab);
    return acc;
  }, {} as Record<string, Task[]>)
);

export const getTaskCountByTab = createSelector(getFilteredTasks, getTabs, (tasks, tabs) =>
  tasks && tabs
    ? tabs?.reduce((acc, tab) => {
        acc[tab.name] = tasks[tab.id]?.length ?? 0;
        return acc;
      }, {} as TabCount)
    : {}
);

export const getBadgeCount = createSelector(getTasks, getNotificationsCount, (tasks, count) =>
  tasks?.length ? doFilter(tasks, count)?.length ?? 0 : 0
);

export const getCount = createSelector(getTasks, getBadgeCount, getTaskCountByTab, getNotificationsCount, (tasks, badge, tabs, { enabled }) =>
  enabled ? { badge, total: tasks?.length ?? 0, tabs } : undefined
);
