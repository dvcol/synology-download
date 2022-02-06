import { createSelector } from '@reduxjs/toolkit';
import { getNotificationsBanner, getNotificationsCount, getPolling, getTab, getTabs, getTasks, isModalOpen } from '@src/store/selectors';
import { TabCount, TaskStatus } from '@src/models';

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

export const getTaskCountByTab = createSelector(getTasks, getTabs, (tasks, tabs) => {
  const countByStatus = tasks.reduce((acc, t) => {
    acc[t.status] ? (acc[t.status] = acc[t.status]++) : (acc[t.status] = 1);
    return acc;
  }, {} as Record<TaskStatus, number>);

  return (
    tabs?.reduce((acc, tab) => {
      acc[tab.name] = tab.status?.reduce((acc, s) => acc + (countByStatus[s] ?? 0), 0) ?? 0;
      return acc;
    }, {} as TabCount) ?? {}
  );
});

export const getBadgeCount = createSelector(getTasks, getTaskCountByTab, getNotificationsCount, (tasks, tabs, { enabled, status }) =>
  enabled ? { badge: tasks?.filter((t) => status?.includes(t?.status)).length ?? 0, total: tasks?.length ?? 0, tabs } : undefined
);
