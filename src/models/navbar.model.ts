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
  Open = 'open',
  About = 'about',
}

export interface NavbarButton {
  type: NavbarButtonType;
  label: string;
  icon: JSX.Element;
  onClick?: MouseEventHandler;
  component?: ForwardRefExoticComponent<any>;
  to?: string;
}
