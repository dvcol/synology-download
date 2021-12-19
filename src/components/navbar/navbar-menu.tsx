import React from 'react';
import { DialogContentText, Divider, IconButton, Menu, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NavbarMenuIcon from './navbar-menu-icon';
import { getUrl, setNavbar } from '../../store';
import { QueryService } from '../../services';
import { ConfirmationDialog } from '../dialog';

type NavbarMenuProps = { label: React.ReactNode };

export const NavbarMenu = ({ label }: NavbarMenuProps) => {
  const dispatch = useDispatch();
  const url = useSelector(getUrl) + 'index.cgi?launchApp=SYNO.SDS.DownloadStation.Application';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleTab = () => dispatch(setNavbar());
  const handleUrl = () => chrome.tabs.create({ url });

  // Dialog
  const [prompt, setPrompt] = React.useState(false);

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
        <NavbarMenuIcon label="Add file upload" icon={<AddIcon />} component={Link} to="/add" onClick={handleTab} />
        <NavbarMenuIcon label="Add url upload" icon={<AddLinkIcon />} component={Link} to="/add" onClick={handleTab} />
        <Divider />
        <NavbarMenuIcon label="Clear completed items" icon={<ClearAllIcon />} onClick={() => QueryService.deleteFinishedTasks().subscribe()} />
        <NavbarMenuIcon label="Resume all" icon={<PlayArrowIcon />} onClick={() => QueryService.resumeAllTasks().subscribe()} />
        <NavbarMenuIcon label="Pause all" icon={<PauseIcon />} onClick={() => QueryService.pauseAllTasks().subscribe()} />
        <NavbarMenuIcon label="Remove all" icon={<DeleteSweepIcon />} onClick={() => setPrompt(true)} />
        <Divider />
        <NavbarMenuIcon label="Settings" icon={<SettingsIcon />} component={Link} to="/settings" onClick={handleTab} />
        <NavbarMenuIcon label="Info" icon={<InfoIcon />} component={Link} to="/info" onClick={handleTab} />
        <NavbarMenuIcon label="Open Download Station" icon={<LaunchIcon />} onClick={handleUrl} />
      </Menu>

      <ConfirmationDialog
        open={prompt}
        title={'Please confirm'}
        description={
          <React.Fragment>
            <DialogContentText id="alert-dialog-description">
              This action will remove <b>all tasks</b> (active, inactive, etc.).
            </DialogContentText>
            <br />
            <DialogContentText id="alert-dialog-description">
              Once deleted, you'll have to re-add all tasks manually, they can not be restored or restarted.
            </DialogContentText>
          </React.Fragment>
        }
        onCancel={() => setPrompt(false)}
        onConfirm={() => {
          setPrompt(false);
          QueryService.deleteAllTasks().subscribe();
        }}
      />
    </React.Fragment>
  );
};

export default NavbarMenu;
