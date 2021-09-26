import React from 'react';
import {Divider, IconButton, Menu, Tooltip} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import LaunchIcon from '@mui/icons-material/Launch';
import MenuItemIcon from "../menu-item-icon/menu-item-icon";
import {Link} from "react-router-dom";
import {useDispatch} from "react-redux";
import {reset} from "../../services/store/slices/navbar.slice";

type NavbarMenuProps = { label: React.ReactNode }

const NavbarMenu = ({label}: NavbarMenuProps) => {
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => {
        setAnchorEl(null);
        // clear tabs
        dispatch(reset());
    };

    return (
        <React.Fragment>
            <Tooltip title="Actions and Settings">
                <IconButton
                    sx={{ml: '0.5rem'}}
                    id="basic-button"
                    aria-controls="basic-menu"
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleClick}
                >
                    {label}
                </IconButton>
            </Tooltip>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItemIcon label="Add file upload" icon={<AddIcon/>} component={Link} to="/add"/>
                <MenuItemIcon label="Add url upload" icon={<AddLinkIcon/>} component={Link} to="/add"/>
                <Divider/>
                <MenuItemIcon label="Clear completed items" icon={<ClearAllIcon/>}/>
                <MenuItemIcon label="Resume all" icon={<PlayArrowIcon/>}/>
                <MenuItemIcon label="Pause all" icon={<PauseIcon/>}/>
                <MenuItemIcon label="Remove all" icon={<DeleteSweepIcon/>}/>
                <Divider/>
                <MenuItemIcon label="Settings" icon={<SettingsIcon/>} component={Link} to="/settings"/>
                <MenuItemIcon label="Open Download Station" icon={<LaunchIcon/>}/>
            </Menu>
        </React.Fragment>
    );
}

export default NavbarMenu;
