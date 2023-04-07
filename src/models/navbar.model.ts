import type { IconButtonProps } from '@mui/material';

import type { ForwardRefExoticComponent, MouseEventHandler } from 'react';

export enum NavbarButtonType {
  Add = 'add',
  Refresh = 'refresh',
  Resume = 'resume',
  Pause = 'pause',
  Remove = 'remove',
  Clear = 'clear',
  Configs = 'configs',
  Settings = 'settings',
  OpenSynology = 'openSynology',
  OpenDownloads = 'openDownloads',
  About = 'about',
  Scrape = 'scrape',
}

export type ModifiedEvent = Pick<MouseEvent, 'shiftKey' | 'altKey'>;

export interface NavbarButton {
  type: NavbarButtonType;
  label: string;
  icon: JSX.Element;
  color?: IconButtonProps['color'];
  onClick?: MouseEventHandler;
  hoverTooltip?: ($event: ModifiedEvent) => string | undefined;
  component?: ForwardRefExoticComponent<any>;
  to?: string;
  hide?: boolean;
  divider?: boolean;
  disabled?: boolean;
}
