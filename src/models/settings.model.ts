import { DownloadStatus } from '@src/models/download.model';
import { LoggingLevel } from '@src/models/logger.model';
import { NavbarButtonType } from '@src/models/navbar.model';

import type { LoginRequest } from '@src/models/synology.model';

import {
  defaultContextMenu,
  defaultDownloadQuickMenu,
  defaultModalQuickMenu,
  defaultQuickMenu,
  defaultRecentDownloadQuickMenu,
  defaultRecentQuickMenu,
} from './menu.model';

import { NotificationLevel } from './notification.model';

import { defaultTabs, TabTemplate } from './tab.model';

import { TaskStatus } from './task.model';

import type { BannerNotificationScope, SnackNotificationScope } from './notification.model';
import type { SettingsSlice } from './store.model';
import type { Tab } from './tab.model';

import type { OptionsObject } from 'notistack';

export enum SettingHeader {
  connection = 'connection',
  downloads = 'downloads',
  interface = 'interface',
  notification = 'notification',
  advanced = 'advanced',
  tasks = 'tasks',
}

export interface SettingsPanelTab {
  label: SettingHeader;
  anchor?: string;
  links: string[];
}

export enum NotificationHeader {
  snack = 'snack',
  banner = 'banner',
  count = 'count',
}

export enum ConnectionHeader {
  credential = 'credentials',
  polling = 'polling',
}

export enum DownloadsHeader {
  general = 'general',
  intercept = 'intercept',
  history = 'history',
}

export enum InterfaceHeader {
  global = 'global',
  tabs = 'tabs',
  quickMenu = 'quick_menu',
  contextMenu = 'context_menu',
}

export enum TasksHeader {
  form = 'form',
}

export enum AdvancedHeader {
  logging = 'logging',
  redux = 'redux',
  storage = 'storage',
}

export enum ConnectionType {
  local = 'local',
  quickConnect = 'quick_connect', // No functioning API
  twoFactor = 'two_factor',
  custom = 'custom',
}

export const ConnectionFormat: Record<string, Required<LoginRequest>['format']> = {
  cookie: 'cookie',
  sid: 'sid',
} as const;

export enum Protocol {
  http = 'http',
  https = 'https',
}

export interface Credentials {
  type?: ConnectionType;
  format?: Required<LoginRequest>['format'];
  authVersion?: number;
  username?: string;
  password?: string;
  otp_code?: string;
  enable_device_token?: boolean;
  device_name?: string;
  device_id?: string;
}

export const defaultCredentials: Credentials = {
  type: ConnectionType.local,
  format: 'cookie',
  authVersion: 3,
  username: 'admin',
  password: '',
  otp_code: '',
  enable_device_token: false,
  device_name: 'Download Station Client',
  device_id: '',
};

export interface ConnectionSettings extends Credentials {
  rememberMe?: boolean;
  autoLogin?: boolean;
  protocol?: Protocol;
  path?: string;
  port?: number;
}

export const defaultConnection: ConnectionSettings = {
  ...defaultCredentials,
  rememberMe: true,
  autoLogin: true,
  protocol: Protocol.http,
  path: 'diskstation',
  port: 5000,
};

export interface PollingSettings {
  enabled: boolean;
  // 0 means disabled
  background: { enabled: boolean; interval: number };
  // 0 means disabled
  popup: { enabled: boolean; interval: number };
}

export const defaultPolling: PollingSettings = {
  enabled: true,
  background: { enabled: true, interval: 20000 },
  popup: { enabled: true, interval: 3000 },
};

export interface NotificationsCount extends Tab {
  enabled: boolean;
}

export interface NotificationsBanner {
  enabled: boolean;
  level: NotificationLevel;
  scope: BannerNotificationScope;
}

export interface NotificationsSnack {
  enabled: boolean;
  level: NotificationLevel;
  scope: SnackNotificationScope;
  timeout: OptionsObject['autoHideDuration'];
  position: OptionsObject['anchorOrigin'];
}

export interface NotificationSettings {
  count: NotificationsCount;
  snack: NotificationsSnack;
  banner: NotificationsBanner;
}

export const defaultNotifications: NotificationSettings = {
  count: {
    enabled: true,
    template: TabTemplate.all,
    status: [...Object.values(TaskStatus), ...Object.values(DownloadStatus)],
    destination: { enabled: false },
    color: '#4285f4',
  },
  snack: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      popup: true,
      content: true,
    },
    timeout: 5000,
    position: { vertical: 'top', horizontal: 'right' },
  },
  banner: {
    enabled: true,
    level: NotificationLevel.info,
    scope: {
      background: true,
      popup: true,
      finished: true,
      failed: true,
    },
  },
};

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  auto = 'auto',
}

export enum ActionScope {
  all = 'all',
  tab = 'tab',
}

export enum InterfaceSize {
  small = 0.8,
  normal = 1,
  large = 1.2,
}

export interface GlobalSettings {
  theme: ThemeMode;
  actions: ActionScope;
  loading: { enabled: boolean; threshold: number };
  task: {
    progressBar: boolean;
    background: boolean;
  };
  download: {
    progressBar: boolean;
    background: boolean;
  };
  navbar: { buttons: NavbarButtonType[] };
  interface: {
    size: InterfaceSize | number;
    pullToRefresh: boolean;
  };
  panel: {
    enabled: boolean;
  };
}

export const defaultGlobal = {
  theme: ThemeMode.auto,
  actions: ActionScope.all,
  loading: { enabled: true, threshold: 300 },
  task: {
    progressBar: true,
    background: true,
  },
  download: {
    progressBar: true,
    background: true,
  },
  navbar: { buttons: [NavbarButtonType.Refresh, NavbarButtonType.Clear] },
  interface: {
    size: InterfaceSize.normal,
    pullToRefresh: true,
  },
  panel: {
    enabled: false,
  },
};

export interface DownloadExtension {
  ext: string;
  mime?: string;
}

export interface DownloadsIntercept {
  enabled: boolean;
  erase: boolean;
  resume: boolean;
  modal: boolean;
  all: boolean;
  extensions: DownloadExtension[];
  active: DownloadExtension[];
}

export interface DownloadSettings {
  enabled: boolean;
  buttons: boolean;
  notifications: boolean;
  transfer: {
    erase: boolean;
    resume: boolean;
    modal: boolean;
  };
  intercept: DownloadsIntercept;
}

export const torrentExtension: DownloadExtension = { ext: '.torrent', mime: 'application/x-bittorrent' };

export const defaultExtensions: DownloadExtension[] = [
  // torrent
  torrentExtension,
  // audio
  { ext: '.flac', mime: 'audio/flac' },
  { ext: '.wav', mime: 'audio/wav' },
  { ext: '.mp3', mime: 'audio/mpeg' },
  { ext: '.aac', mime: 'audio/x-aac' },
  { ext: '.ogg', mime: 'audio/ogg' },
  // video
  { ext: '.mp4', mime: 'video/mp4' },
  { ext: '.mpeg', mime: 'video/mpeg' },
  { ext: '.mkv', mime: 'video/x-matroska' },
  // zip
  { ext: '.7z', mime: 'application/x-7z-compressed' },
  { ext: '.zip', mime: 'application/zip' },
  { ext: '.gz', mime: 'application/gzip' },
  { ext: '.tar', mime: 'application/x-tar' },
  // images
  { ext: '.jpeg', mime: 'image/jpeg' },
  { ext: '.jpg', mime: 'image/jpeg' },
  { ext: '.png', mime: 'image/png' },
  { ext: '.svg', mime: 'image/svg+xml' },
  { ext: '.tif', mime: 'image/tiff' },
  { ext: '.gif', mime: 'image/gif' },
  // documents
  { ext: '.pdf', mime: 'application/pdf' },
];

export const defaultDownloads: DownloadSettings = {
  enabled: true,
  buttons: true,
  notifications: true,
  transfer: {
    erase: true,
    resume: true,
    modal: true,
  },
  intercept: {
    enabled: false,
    resume: false,
    erase: true,
    modal: false,
    all: false,
    extensions: defaultExtensions,
    active: [{ ext: '.torrent', mime: 'application/x-bittorrent' }],
  },
};

export enum ServiceInstance {
  Background = 'background',
  Content = 'content',
  Popup = 'popup',
  Panel = 'panel',
  Option = 'option',
  Standalone = 'standalone',
}

export enum ServiceInstanceColors {
  Background = '#7dffc7',
  Content = '#ccbbff',
  Popup = '#42e9ff',
  Panel = '#4284ff',
  Option = '#42ffb7',
  Standalone = '#42ff78',
}

export const ServiceInstanceColorsMap: Record<ServiceInstance, ServiceInstanceColors> = {
  [ServiceInstance.Background]: ServiceInstanceColors.Background,
  [ServiceInstance.Content]: ServiceInstanceColors.Content,
  [ServiceInstance.Popup]: ServiceInstanceColors.Popup,
  [ServiceInstance.Panel]: ServiceInstanceColors.Panel,
  [ServiceInstance.Option]: ServiceInstanceColors.Option,
  [ServiceInstance.Standalone]: ServiceInstanceColors.Standalone,
};

export interface Log {
  timestamp: string;
  level: LoggingLevel;
  source: ServiceInstance;
  value: string;
  params?: string;
}

export type AdvancedLoggingLevels = Partial<Record<ServiceInstance, LoggingLevel>>;

export interface AdvancedLogging {
  enabled?: boolean;
  levels?: AdvancedLoggingLevels;
  history?: boolean;
  historyMax?: number;
}

export interface AdvancedSettings {
  logging: AdvancedLogging;
}

export const defaultLoggingLevels: AdvancedLoggingLevels = Object.values(ServiceInstance).reduce(
  (acc, next) => ({ ...acc, [next]: LoggingLevel.error }),
  {},
);

export const defaultAdvancedLogging: AdvancedLogging = {
  enabled: true,
  levels: defaultLoggingLevels,
  history: false,
  historyMax: 1000,
};

export const defaultAdvancedSettings: AdvancedSettings = {
  logging: defaultAdvancedLogging,
};

export enum SyncSettingMode {
  sync = 'sync',
  local = 'local',
}

export interface SyncSettings {
  mode: SyncSettingMode;
}

export const defaultSyncSettings: SyncSettings = {
  mode: SyncSettingMode.sync,
};

export interface TaskSettings {
  clearOnExist: boolean;
}

export const defaultTaskSettings = {
  clearOnExist: true,
};

export const defaultSettings: SettingsSlice = {
  notifications: defaultNotifications,
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultContextMenu],
  quick: [defaultQuickMenu, defaultModalQuickMenu, defaultRecentQuickMenu, defaultDownloadQuickMenu, defaultRecentDownloadQuickMenu],
  global: defaultGlobal,
  tasks: defaultTaskSettings,
  downloads: defaultDownloads,
  advanced: defaultAdvancedSettings,
  sync: defaultSyncSettings,
};
