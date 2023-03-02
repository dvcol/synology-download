import AddLinkIcon from '@mui/icons-material/AddLink';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import { DialogContentText, Divider, IconButton, Menu, Tooltip } from '@mui/material';

import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import { useI18n } from '@dvcol/web-extension-utils';

import { ConfirmationDialog } from '@src/components';
import type { NavbarButton } from '@src/models';
import { AppLinks, AppRoute, ErrorType, LoginError, NavbarButtonType } from '@src/models';
import { DownloadService, NotificationService, QueryService } from '@src/services';
import { resetDownloads, resetTasks, setNavbar } from '@src/store/actions';
import { getGlobalNavbarButton, getLogged, getSettingsDownloadsButtons, getSettingsDownloadsEnabled, getUrl } from '@src/store/selectors';
import { createTab } from '@src/utils';

import NavbarMenuIcon from './navbar-menu-icon';

type NavbarMenuProps = { menuIcon: React.ReactNode };

export const NavbarMenu = ({ menuIcon }: NavbarMenuProps) => {
  const i18n = useI18n('navbar', 'menu');
  const dispatch = useDispatch();
  const url = useSelector(getUrl) + AppLinks.DownloadStation;
  const navbarButtons = useSelector(getGlobalNavbarButton);
  const logged = useSelector(getLogged);
  const downloadEnabled = useSelector(getSettingsDownloadsEnabled);
  const downloadButtons = useSelector(getSettingsDownloadsButtons);

  const [anchorEl, setAnchorEl] = React.useState<null | Element>(null);
  const open = Boolean(anchorEl);

  const handleClick = <T extends Element>(event: React.MouseEvent<T>) => setAnchorEl(event.currentTarget);
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

  // Button list
  const buttons: NavbarButton[] = [
    {
      type: NavbarButtonType.Add,
      label: i18n('menu_add'),
      icon: <AddLinkIcon />,
      color: 'primary',
      component: Link,
      to: AppRoute.Add,
      onClick: handleClearTab,
    },
    {
      type: NavbarButtonType.Refresh,
      label: i18n('menu_refresh'),
      icon: <RefreshIcon />,
      disabled: !downloadEnabled && !logged,
      onClick: $event => {
        if ($event.shiftKey) {
          dispatch(resetDownloads());
          dispatch(resetTasks());
        }
        if (downloadButtons && !$event.altKey) DownloadService.searchAll().subscribe();
        if (logged && !$event.shiftKey) QueryService.listTasks().subscribe(handleError('refresh'));
      },
    },
    {
      type: NavbarButtonType.Resume,
      label: i18n('menu_resume'),
      icon: <PlayArrowIcon />,
      color: 'success',
      disabled: !downloadEnabled && !logged,
      onClick: $event => {
        if (downloadButtons && !$event.altKey) DownloadService.resumeAll().subscribe();
        if (logged && !$event.shiftKey) QueryService.resumeAllTasks().subscribe(handleError('resume'));
      },
    },
    {
      type: NavbarButtonType.Pause,
      label: i18n('menu_pause'),
      icon: <PauseIcon />,
      color: 'warning',
      disabled: !downloadEnabled && !logged,
      onClick: $event => {
        if (downloadButtons && !$event.altKey) DownloadService.pauseAll().subscribe();
        if (logged && !$event.shiftKey) QueryService.pauseAllTasks().subscribe(handleError('pause'));
      },
    },
    {
      type: NavbarButtonType.Remove,
      label: i18n('menu_remove'),
      icon: <DeleteSweepIcon />,
      color: 'error',
      disabled: !downloadEnabled && !logged,
      onClick: () => setPrompt(true),
    },
    {
      type: NavbarButtonType.Clear,
      label: i18n('menu_clear'),
      icon: <ClearAllIcon />,
      color: 'primary',
      disabled: !downloadEnabled && !logged,
      onClick: $event => {
        if (downloadButtons && !$event.altKey) DownloadService.eraseAll().subscribe();
        if (logged && !$event.shiftKey) QueryService.deleteFinishedTasks().subscribe(handleError('clear'));
      },
    },
    {
      type: NavbarButtonType.Configs,
      label: i18n(`menu_configs`),
      icon: <SettingsIcon />,
      color: 'primary',
      component: Link,
      to: AppRoute.Config,
      onClick: handleClearTab,
    },
    {
      type: NavbarButtonType.Settings,
      label: i18n('menu_settings'),
      icon: <TuneIcon />,
      color: 'primary',
      component: Link,
      to: AppRoute.Settings,
      onClick: handleClearTab,
    },
    { type: NavbarButtonType.OpenSynology, label: i18n('menu_open'), icon: <LaunchIcon />, color: 'primary', onClick: handleUrl },
    {
      type: NavbarButtonType.OpenDownloads,
      label: i18n('menu_open_downloads'),
      icon: <DriveFileMoveIcon />,
      color: 'primary',
      onClick: () => DownloadService.show().subscribe(),
    },
    {
      type: NavbarButtonType.About,
      label: i18n('menu_about'),
      icon: <InfoIcon />,
      color: 'primary',
      component: Link,
      to: AppRoute.About,
      onClick: handleClearTab,
    },
  ];

  return (
    <React.Fragment>
      {(logged || downloadEnabled) &&
        buttons
          ?.filter(({ type }) => navbarButtons?.includes(type))
          ?.map(({ type, icon, label, ..._props }) => (
            <Tooltip title={label} key={type}>
              <IconButton id={`${type}-pinned`} aria-controls={`${type}-pinned-button`} {..._props}>
                {icon}
              </IconButton>
            </Tooltip>
          ))}

      {!logged && (
        <Tooltip title={i18n('menu_login')} key={'login'}>
          <IconButton
            id={`login-pinned`}
            aria-controls={`login-pinned-button`}
            color={'error'}
            component={Link}
            to={AppRoute.Settings}
            onClick={handleClearTab}
          >
            <PowerOffIcon />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Actions and Settings">
        <IconButton
          sx={{ m: '0 0.25rem' }}
          id="dropdown-menu-button"
          aria-controls="dropdown-menu-button"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
        >
          {menuIcon}
        </IconButton>
      </Tooltip>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        MenuListProps={{ 'aria-labelledby': 'dropdown-menu' }}
      >
        <NavbarMenuIcon {...buttons[0]} />
        <Divider />
        <NavbarMenuIcon {...buttons[1]} />
        <NavbarMenuIcon {...buttons[2]} />
        <NavbarMenuIcon {...buttons[3]} />
        <NavbarMenuIcon {...buttons[4]} />
        <NavbarMenuIcon {...buttons[5]} />
        <Divider />
        <NavbarMenuIcon {...buttons[6]} />
        <NavbarMenuIcon {...buttons[7]} />
        <NavbarMenuIcon {...buttons[8]} />
        {downloadEnabled && <NavbarMenuIcon {...buttons[9]} />}
        <Divider />
        <NavbarMenuIcon {...buttons[10]} />
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
        onConfirm={$event => {
          setPrompt(false);
          if (downloadButtons && !$event.altKey) DownloadService.cancelAll().subscribe();
          if (logged && !$event.shiftKey) QueryService.deleteAllTasks().subscribe(handleError('delete'));
        }}
      />
    </React.Fragment>
  );
};

export default NavbarMenu;
