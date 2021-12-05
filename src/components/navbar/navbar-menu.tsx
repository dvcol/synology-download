import React from 'react';
import { Divider, IconButton, Menu, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NavbarMenuIcon from './navbar-menu-icon';
import { getUrl, setNavbar } from '../../store';

type NavbarMenuProps = { label: React.ReactNode };

export const NavbarMenu = ({ label }: NavbarMenuProps) => {
  const url = useSelector(getUrl);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleTab = () => setNavbar();
  const handleUrl = () => chrome.tabs.create({ url });
  return (
    <React.Fragment>
      <Tooltip title="Actions and Settings">
        <IconButton
          sx={{ ml: '0.5rem' }}
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
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <NavbarMenuIcon label="Add file upload" icon={<AddIcon />} component={Link} to="/add" />
        <NavbarMenuIcon label="Add url upload" icon={<AddLinkIcon />} component={Link} to="/add" />
        <Divider />
        <NavbarMenuIcon label="Clear completed items" icon={<ClearAllIcon />} />
        <NavbarMenuIcon label="Resume all" icon={<PlayArrowIcon />} />
        <NavbarMenuIcon label="Pause all" icon={<PauseIcon />} />
        <NavbarMenuIcon label="Remove all" icon={<DeleteSweepIcon />} />
        <Divider />
        <NavbarMenuIcon label="Settings" icon={<SettingsIcon />} component={Link} to="/settings" onClick={handleTab} />
        <NavbarMenuIcon label="Open Download Station" icon={<LaunchIcon />} onClick={handleUrl} />
      </Menu>
    </React.Fragment>
  );
};

export default NavbarMenu;
