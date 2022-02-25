import AddLinkIcon from '@mui/icons-material/AddLink';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import { DialogContentText, Divider, IconButton, Menu, Tooltip } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import { ConfirmationDialog } from '@src/components';
import { AppLinks, AppRoute, ErrorType, LoginError } from '@src/models';
import { NotificationService, QueryService } from '@src/services';
import { setNavbar } from '@src/store/actions';
import { getUrl } from '@src/store/selectors';
import { createTab, useI18n } from '@src/utils';

import NavbarMenuIcon from './navbar-menu-icon';

type NavbarMenuProps = { label: React.ReactNode };

export const NavbarMenu = ({ label }: NavbarMenuProps) => {
  const i18n = useI18n('navbar', 'menu');
  const dispatch = useDispatch();
  const url = useSelector(getUrl) + AppLinks.DownloadStation;

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClearTab = () => dispatch(setNavbar());
  const handleUrl = () => createTab({ url });
  const handleError = (button: string) => ({
    error: (error: any) => {
      if (error instanceof LoginError || ErrorType.Login === error?.type) {
        NotificationService.loginRequired();
      } else if (error) {
        NotificationService.error({
          title: i18n(`task_${button}_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
      }
    },
  });

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
        <NavbarMenuIcon label={i18n('menu_add')} icon={<AddLinkIcon />} component={Link} to={AppRoute.Add} onClick={handleClearTab} />
        <Divider />
        <NavbarMenuIcon
          label={i18n('menu_refresh')}
          icon={<RefreshIcon />}
          onClick={() => QueryService.listTasks().subscribe(handleError('refresh'))}
        />
        <NavbarMenuIcon
          label={i18n('menu_resume')}
          icon={<PlayArrowIcon />}
          onClick={() => QueryService.resumeAllTasks().subscribe(handleError('resume'))}
        />
        <NavbarMenuIcon
          label={i18n('menu_pause')}
          icon={<PauseIcon />}
          onClick={() => QueryService.pauseAllTasks().subscribe(handleError('pause'))}
        />
        <NavbarMenuIcon label={i18n('menu_remove')} icon={<DeleteSweepIcon />} onClick={() => setPrompt(true)} />
        <NavbarMenuIcon
          label={i18n('menu_clear')}
          icon={<ClearAllIcon />}
          onClick={() => QueryService.deleteFinishedTasks().subscribe(handleError('clear'))}
        />
        <Divider />
        <NavbarMenuIcon label={i18n('menu_configs')} icon={<SettingsIcon />} component={Link} to={AppRoute.Config} onClick={handleClearTab} />
        <NavbarMenuIcon label={i18n('menu_settings')} icon={<TuneIcon />} component={Link} to={AppRoute.Settings} onClick={handleClearTab} />
        <NavbarMenuIcon label={i18n('menu_open')} icon={<LaunchIcon />} onClick={handleUrl} />
        <Divider />
        <NavbarMenuIcon label={i18n('menu_about')} icon={<InfoIcon />} component={Link} to={AppRoute.About} onClick={handleClearTab} />
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
          QueryService.deleteAllTasks().subscribe(handleError('delete'));
        }}
      />
    </React.Fragment>
  );
};

export default NavbarMenu;
