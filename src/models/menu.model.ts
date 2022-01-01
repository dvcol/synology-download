import { v4 as uuid } from 'uuid';
import { MaterialIcon } from './material-ui.model';

export interface Menu {
  id: string;
  title: string;
  modal?: boolean;
  destination?: { custom?: boolean; path?: string };
}

export interface QuickMenu extends Menu {
  icon?: MaterialIcon;
}

export const defaultQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Add to Synology Diskstation',
  icon: MaterialIcon.download,
};

/**
 * Options for saved context Menus
 */
export interface ContextMenu extends Menu {
  contexts: string[];
}

export const defaultContextMenu: ContextMenu = {
  id: uuid(),
  title: 'Add to Synology Diskstation',
  contexts: ['link', 'audio', 'video', 'image', 'selection'],
};
