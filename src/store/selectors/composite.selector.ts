import { createSelector } from '@reduxjs/toolkit';
import { getTab } from './navbar.selector';
import { getPolling, getTabs } from './settings.selector';
import { isModalOpen } from './modal.selector';

export const getTabOrFirst = createSelector(getTab, getTabs, (tab, tabs) => tab ?? (tabs?.length ? tabs[0] : tab));

export const getInterval = createSelector(isModalOpen, getPolling, (open, polling) => (open ? polling?.popup : polling?.background));

export const getPollingEnabled = createSelector(getPolling, getInterval, (polling, interval) => polling?.enabled && !!interval);
