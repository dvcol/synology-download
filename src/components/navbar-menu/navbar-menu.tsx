import React from 'react';
import {Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import LaunchIcon from '@mui/icons-material/Launch';

type NavbarMenuProps = { label: string | React.ReactNode }

const NavbarMenu = ({label}: NavbarMenuProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
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
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                <MenuItem>
                    <ListItemIcon>
                        <AddIcon/>
                    </ListItemIcon>
                    Add file upload
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <AddLinkIcon/>
                    </ListItemIcon>
                    Add url upload
                </MenuItem>
                <Divider/>
                <MenuItem>
                    <ListItemIcon>
                        <ClearAllIcon/>
                    </ListItemIcon>
                    Clear completed items
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <PlayArrowIcon/>
                    </ListItemIcon>
                    Resume all
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <PauseIcon/>
                    </ListItemIcon>
                    Pause all
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <DeleteSweepIcon/>
                    </ListItemIcon>
                    Remove all
                </MenuItem>
                <Divider/>
                <MenuItem>
                    <ListItemIcon>
                        <SettingsIcon/>
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <LaunchIcon/>
                    </ListItemIcon>
                    Open Download Station
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}

export default NavbarMenu;