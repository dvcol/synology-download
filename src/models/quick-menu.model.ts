import { v4 as uuid } from 'uuid';
import { MaterialIcon } from './material-ui.model';

export interface QuickMenu {
  id: string;
  title: string;
  modal?: boolean;
  destination?: { custom?: boolean; path?: string };
  icon?: MaterialIcon;
}

export const defaultQuickMenu: QuickMenu = {
  id: uuid(),
  title: 'Add to Synology Diskstation',
  icon: MaterialIcon.download,
};
