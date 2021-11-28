import React from 'react';
import { ListItemIcon, MenuItem } from '@mui/material';

type MenuItemIconProps = {
  label: string;
  icon: React.ReactNode;
  [key: string]: any;
};

export const NavbarMenuIcon = ({
  label,
  icon,
  ...props
}: MenuItemIconProps) => (
  <MenuItem {...props}>
    <ListItemIcon>{icon}</ListItemIcon>
    {label}
  </MenuItem>
);

export default NavbarMenuIcon;
