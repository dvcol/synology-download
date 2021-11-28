import { v4 as uuid } from 'uuid';

/**
 * Options for saved context Menus
 */
export interface ContextMenuOption {
  id: string;
  title: string;
  contexts: string[];
}

export const defaultMenu: ContextMenuOption = {
  id: uuid(),
  title: 'Download with Synology Diskstation',
  contexts: ['link', 'audio', 'video', 'image', 'selection'],
};
