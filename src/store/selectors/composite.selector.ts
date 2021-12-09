import { createSelector } from '@reduxjs/toolkit';
import { getTab } from './navbar.selector';
import { getNotificationsCount, getPolling, getTabs } from './settings.selector';
import { isModalOpen } from './state.selector';
import { getTasks } from './tasks.selector';

export const getTabOrFirst = createSelector(getTab, getTabs, (tab, tabs) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getPollingInterval = createSelector(isModalOpen, getPolling, (open, polling) =>
  open ? polling?.popup?.interval : polling?.background?.interval
);

export const getPollingEnabled = createSelector(
  getPolling,
  isModalOpen,
  (polling, open) => polling?.enabled && (open ? polling?.popup?.enabled : polling?.background?.enabled)
);

export const getTasksCount = createSelector(
  getTasks,
  getNotificationsCount,
  (tasks, count) => tasks?.filter((t) => count?.status?.includes(t?.status)).length ?? 0
);
