import type { FC } from 'react';

import type { NavbarButton } from '../../models/navbar.model';

import { ListItemIcon, MenuItem } from '@mui/material';
import React, { use } from 'react';

import { ContainerContext } from '../../store/context/container.context';
import { TooltipHoverChange } from '../common/tooltip/tooltip-hover-change';

type MenuItemIconProps = {
  label: string;
  icon: React.ReactNode;
} & NavbarButton;

export const NavbarMenuIcon: FC<MenuItemIconProps> = ({ label, icon, hoverTooltip, ...props }) => {
  const { containerRef } = use(ContainerContext);
  return (
    <TooltipHoverChange hoverTooltip={hoverTooltip} props={{ placement: 'right' }} getContainer={() => containerRef?.current ?? null}>
      <MenuItem {...props}>
        <ListItemIcon>{icon}</ListItemIcon>
        {label}
      </MenuItem>
    </TooltipHoverChange>
  );
};

export default NavbarMenuIcon;
