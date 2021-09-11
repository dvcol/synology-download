import React from "react";
import {ListItemIcon, MenuItem} from "@mui/material";

type MenuItemIconProps = { label: string, icon: React.ReactNode, [key: string]: any };

const MenuItemIcon = ({label, icon, ...props}: MenuItemIconProps) =>
    (
        <MenuItem {...props}>
            <ListItemIcon>
                {icon}
            </ListItemIcon>
            {label}
        </MenuItem>
    )

export default MenuItemIcon;
