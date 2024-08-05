import { v4 as uuid } from 'uuid';

import type { ContextMenuCreate as ChromeContextMenu } from '@dvcol/web-extension-utils';

import { MaterialIcon } from './material-ui.model';

export interface Menu {
  id: string;
  title: string;
  modal: boolean;
  popup: boolean;
  destination: { custom: boolean; path?: string };
}

export enum QuickMenuType {
  Task = 'task',
  Download = 'download',
  Recent = 'recent',
  RecentDownload = 'recent_download',
}

export interface QuickMenu extends Menu {
  icon?: MaterialIcon;
  max?: number;
  type: QuickMenuType;
}

export const defaultQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Send to Synology',
  icon: MaterialIcon.server,
  modal: false,
  popup: false,
  destination: { custom: false },
  max: 5,
  type: QuickMenuType.Task,
};

export const defaultModalQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Open custom modal',
  icon: MaterialIcon.server,
  modal: true,
  popup: false,
  destination: { custom: false },
  max: 5,
  type: QuickMenuType.Task,
};

export const defaultRecentQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Recent destinations',
  icon: MaterialIcon.history,
  modal: false,
  popup: false,
  destination: { custom: false },
  max: 5,
  type: QuickMenuType.Recent,
};

export const defaultDownloadQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Save to disk (local)',
  icon: MaterialIcon.download,
  modal: false,
  popup: false,
  destination: { custom: false },
  max: 5,
  type: QuickMenuType.Download,
};

export const defaultRecentDownloadQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Recent folders (local)',
  icon: MaterialIcon.historyAlt,
  modal: false,
  popup: false,
  destination: { custom: false },
  max: 5,
  type: QuickMenuType.RecentDownload,
};

export enum ContextType {
  all = 'all',
  page = 'page',
  frame = 'frame',
  selection = 'selection',
  link = 'link',
  editable = 'editable',
  image = 'image',
  video = 'video',
  audio = 'audio',
  launcher = 'launcher',
  browser_action = 'browser_action',
  page_action = 'page_action',
  action = 'action',
}

/**
 * Options for saved context Menus
 */
export interface ContextMenu extends Menu {
  contexts: ContextType[];
}

export const defaultContextMenu: ContextMenu = {
  id: uuid(),
  title: 'Add to Synology Diskstation',
  contexts: [ContextType.link, ContextType.audio, ContextType.video, ContextType.image, ContextType.selection],
  modal: true,
  popup: false,
  destination: { custom: false },
};

export const scrapeContextMenu: ChromeContextMenu = {
  id: uuid(),
  title: 'Scrape Page',
  contexts: [ContextType.page],
};
