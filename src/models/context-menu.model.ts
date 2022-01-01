import { v4 as uuid } from 'uuid';

/**
 * Options for saved context Menus
 */
export interface ContextMenu {
  id: string;
  title: string;
  contexts: string[];
}

export const defaultContextMenu: ContextMenu = {
  id: uuid(),
  title: 'Download with Synology Diskstation',
  contexts: ['link', 'audio', 'video', 'image', 'selection'],
};
