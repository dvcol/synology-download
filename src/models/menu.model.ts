import { v4 as uuid } from 'uuid';

import { MaterialIcon } from './material-ui.model';

export interface Menu {
  id: string;
  title: string;
  modal: boolean;
  destination: { custom: boolean; path?: string };
}

export enum QuickMenuType {
  Task = 'task',
  Download = 'download',
}

export interface QuickMenu extends Menu {
  icon?: MaterialIcon;
  type: QuickMenuType;
}

export const defaultQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Add to Synology Diskstation',
  icon: MaterialIcon.download,
  modal: false,
  destination: { custom: false },
  type: QuickMenuType.Task,
};

export const defaultDownloadQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Download to disk (local)',
  icon: MaterialIcon.download,
  modal: false,
  destination: { custom: false },
  type: QuickMenuType.Download,
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
  destination: { custom: false },
};
