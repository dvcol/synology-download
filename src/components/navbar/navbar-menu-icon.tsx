import React, { FC } from 'react';
import { ListItemIcon, MenuItem } from '@mui/material';

type MenuItemIconProps = {
  label: string;
  icon: React.ReactNode;
  [key: string]: any;
};

export const NavbarMenuIcon: FC<MenuItemIconProps> = ({ label, icon, ...props }) => (
  <MenuItem {...props}>
    <ListItemIcon>{icon}</ListItemIcon>
    {label}
  </MenuItem>
);

export default NavbarMenuIcon;
