import { ListItemIcon, MenuItem } from '@mui/material';

import React from 'react';

import { TooltipHoverChange } from '@src/components';
import type { NavbarButton } from '@src/models';

import type { FC } from 'react';

type MenuItemIconProps = {
  label: string;
  icon: React.ReactNode;
} & NavbarButton;

export const NavbarMenuIcon: FC<MenuItemIconProps> = ({ label, icon, hoverTooltip, ...props }) => {
  return (
    <TooltipHoverChange hoverTooltip={hoverTooltip} props={{ placement: 'right' }}>
      <MenuItem {...props}>
        <ListItemIcon>{icon}</ListItemIcon>
        {label}
      </MenuItem>
    </TooltipHoverChange>
  );
};

export default NavbarMenuIcon;
