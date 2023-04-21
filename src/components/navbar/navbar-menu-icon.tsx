import { ListItemIcon, MenuItem } from '@mui/material';

import React, { useContext } from 'react';

import { TooltipHoverChange } from '@src/components';
import type { NavbarButton } from '@src/models';
import { ContainerContext } from '@src/store';

import type { FC } from 'react';

type MenuItemIconProps = {
  label: string;
  icon: React.ReactNode;
} & NavbarButton;

export const NavbarMenuIcon: FC<MenuItemIconProps> = ({ label, icon, hoverTooltip, ...props }) => {
  const { containerRef } = useContext(ContainerContext);
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
