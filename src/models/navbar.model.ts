import type { IconButtonProps } from '@mui/material/IconButton/IconButton';

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
}

export interface NavbarButton {
  type: NavbarButtonType;
  label: string;
  icon: JSX.Element;
  color?: IconButtonProps['color'];
  onClick?: MouseEventHandler;
  component?: ForwardRefExoticComponent<any>;
  to?: string;
  disabled?: boolean;
}
