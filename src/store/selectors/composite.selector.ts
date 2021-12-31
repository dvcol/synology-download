import { createSelector } from '@reduxjs/toolkit';
import { getTab } from './navbar.selector';
import { getNotificationsBanner, getNotificationsCount, getPolling, getTabs } from './settings.selector';
import { isModalOpen } from './state.selector';
import { getTasks } from './tasks.selector';

export const getTabOrFirst = createSelector(getTab, getTabs, (tab, tabs) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getPollingInterval = createSelector(isModalOpen, getPolling, (open, polling) =>
  open ? polling?.popup?.interval : polling?.background?.interval
);

export const getPollingEnabled = createSelector(
  getPolling,
  isModalOpen,
  ({ enabled, popup, background }, open) => enabled && (open ? popup?.enabled : background?.enabled)
);

export const getTasksCount = createSelector(getTasks, getNotificationsCount, (tasks, { enabled, status }) =>
  enabled ? tasks?.filter((t) => status?.includes(t?.status)).length ?? 0 : undefined
);

export const getNotificationsBannerEnabled = createSelector(
  getNotificationsBanner,
  isModalOpen,
  ({ enabled, scope }, open) => enabled && (open ? scope?.popup : scope?.background)
);
