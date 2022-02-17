import React from 'react';
import { DialogContentText, Divider, IconButton, Menu, Tooltip } from '@mui/material';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import AddLinkIcon from '@mui/icons-material/AddLink';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import SettingsIcon from '@mui/icons-material/Settings';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';
import TuneIcon from '@mui/icons-material/Tune';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import NavbarMenuIcon from './navbar-menu-icon';
import { setNavbar } from '@src/store/actions';
import { getUrl } from '@src/store/selectors';
import { QueryService } from '@src/services';
import { ConfirmationDialog } from '@src/components';
import { useI18n } from '@src/utils';

type NavbarMenuProps = { label: React.ReactNode };

export const NavbarMenu = ({ label }: NavbarMenuProps) => {
  const i18n = useI18n('navbar', 'menu');
  const dispatch = useDispatch();
  const url = useSelector(getUrl) + 'index.cgi?launchApp=SYNO.SDS.DownloadStation.Application';

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClearTab = () => dispatch(setNavbar());
  const handleUrl = () => chrome.tabs.create({ url });

  // Dialog
  const [prompt, setPrompt] = React.useState(false);

  return (
    <React.Fragment>
      <Tooltip title="Actions and Settings">
        <IconButton
          sx={{ m: '0 0.25rem' }}
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
        <NavbarMenuIcon label={i18n('menu_add')} icon={<AddLinkIcon />} component={Link} to="/add" onClick={handleClearTab} />
        <Divider />
        <NavbarMenuIcon label={i18n('menu_refresh')} icon={<RefreshIcon />} onClick={() => QueryService.listTasks().subscribe()} />
        <NavbarMenuIcon label={i18n('menu_resume')} icon={<PlayArrowIcon />} onClick={() => QueryService.resumeAllTasks().subscribe()} />
        <NavbarMenuIcon label={i18n('menu_pause')} icon={<PauseIcon />} onClick={() => QueryService.pauseAllTasks().subscribe()} />
        <NavbarMenuIcon label={i18n('menu_remove')} icon={<DeleteSweepIcon />} onClick={() => setPrompt(true)} />
        <NavbarMenuIcon label={i18n('menu_clear')} icon={<ClearAllIcon />} onClick={() => QueryService.deleteFinishedTasks().subscribe()} />
        <Divider />
        <NavbarMenuIcon label={i18n('menu_info')} icon={<SettingsIcon />} component={Link} to="/config" onClick={handleClearTab} />
        <NavbarMenuIcon label={i18n('menu_settings')} icon={<TuneIcon />} component={Link} to="/settings" onClick={handleClearTab} />
        <NavbarMenuIcon label={i18n('menu_open')} icon={<LaunchIcon />} onClick={handleUrl} />
      </Menu>

      <ConfirmationDialog
        open={prompt}
        title={i18n('confirmation_title')}
        description={
          <React.Fragment>
            <DialogContentText id="alert-dialog-description">{i18n('confirmation_line_1')}</DialogContentText>
            <br />
            <DialogContentText id="alert-dialog-description">{i18n('confirmation_line_2')}</DialogContentText>
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
