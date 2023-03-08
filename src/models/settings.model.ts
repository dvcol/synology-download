import { DownloadStatus } from '@src/models/download.model';
import { NavbarButtonType } from '@src/models/navbar.model';

import { defaultContextMenu, defaultDownloadQuickMenu, defaultModalQuickMenu, defaultQuickMenu, defaultRecentQuickMenu } from './menu.model';

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
}

export enum InterfaceHeader {
  global = 'global',
  tabs = 'tabs',
  quickMenu = 'quick_menu',
  contextMenu = 'context_menu',
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
}

export enum Protocol {
  http = 'http',
  https = 'https',
}

export interface Credentials {
  type?: ConnectionType;
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
  authVersion: 3,
  username: 'admin',
  password: '',
  otp_code: '',
  enable_device_token: false,
  device_name: 'Download Station Client',
  device_id: '',
};

export interface Connection extends Credentials {
  rememberMe?: boolean;
  autoLogin?: boolean;
  protocol?: Protocol;
  path?: string;
  port?: number;
}

export const defaultConnection: Connection = {
  ...defaultCredentials,
  rememberMe: true,
  autoLogin: true,
  protocol: Protocol.http,
  path: 'diskstation',
  port: 5000,
};

export interface Polling {
  enabled: boolean;
  // 0 means disabled
  background: { enabled: boolean; interval: number };
  // 0 means disabled
  popup: { enabled: boolean; interval: number };
}

export const defaultPolling: Polling = {
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

export interface Notifications {
  count: NotificationsCount;
  snack: NotificationsSnack;
  banner: NotificationsBanner;
}

export const defaultNotifications: Notifications = {
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
    position: { vertical: 'bottom', horizontal: 'right' },
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

export interface Global {
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

export interface Downloads {
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

export const defaultExtensions = [
  // torrent
  { ext: '.torrent', mime: 'application/x-bittorrent' },
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

export enum LoggingLevel {
  trace = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
}

export const LoggingLevelLevelKeys = {
  [LoggingLevel.trace]: 'trace',
  [LoggingLevel.debug]: 'debug',
  [LoggingLevel.info]: 'info',
  [LoggingLevel.warn]: 'warn',
  [LoggingLevel.error]: 'error',
};

export enum LogInstance {
  Background = 'background',
  Popup = 'popup',
  Option = 'option',
  Content = 'content',
}

export interface Log {
  timestamp: string;
  level: LoggingLevel;
  source: LogInstance;
  value: string;
  params?: string;
}

export interface AdvancedLogging {
  enabled?: boolean;
  level?: LoggingLevel;
  history?: boolean;
  historyMax?: number;
}

export interface AdvancedSettings {
  logging: AdvancedLogging;
}

export const defaultAdvancedLogging = {
  enabled: true,
  level: LoggingLevel.error,
  history: false,
  historyMax: 1000,
};

export const defaultAdvancedSettings = {
  logging: defaultAdvancedLogging,
};

export const defaultDownloads = {
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

export const defaultSettings: SettingsSlice = {
  notifications: defaultNotifications,
  connection: defaultConnection,
  polling: defaultPolling,
  tabs: defaultTabs,
  menus: [defaultContextMenu],
  quick: [defaultQuickMenu, defaultModalQuickMenu, defaultRecentQuickMenu, defaultDownloadQuickMenu],
  global: defaultGlobal,
  downloads: defaultDownloads,
  advanced: defaultAdvancedSettings,
};
