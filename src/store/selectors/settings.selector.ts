import { createSelector } from '@reduxjs/toolkit';
import { StoreState } from '../store';
import { Connection } from '@src/models';

export const getSettings = createSelector(
  (state: StoreState) => state,
  (state) => state.settings
);

export const getTabs = createSelector(getSettings, (setting) => setting?.tabs);

export const getMenus = createSelector(getSettings, (setting) => setting?.menus);

export const getQuick = createSelector(getSettings, (setting) => setting?.quick);

export const getConnection = createSelector(getSettings, (setting) => setting?.connection);

export const urlReducer = (connection: Connection) => {
  if (connection.protocol && connection.path && connection.port) {
    return new URL(`${connection.protocol}://${connection.path}:${connection.port}`).toString();
  }
  return '';
};

export const getUrl = createSelector(getConnection, urlReducer);

export const getUsername = createSelector(getConnection, (connection) => connection?.username);

export const getPassword = createSelector(getConnection, (connection) => connection?.password);

export const getPolling = createSelector(getSettings, (setting) => setting?.polling);

export const getNotifications = createSelector(getSettings, (setting) => setting?.notifications);

export const getNotificationsCount = createSelector(getNotifications, (notifications) => notifications?.count);

export const getNotificationsSnack = createSelector(getNotifications, (notifications) => notifications?.snack);

export const getNotificationsBanner = createSelector(getNotifications, (notifications) => notifications?.banner);

export const getNotificationsBannerLevel = createSelector(getNotificationsBanner, (banner) => banner?.level);
