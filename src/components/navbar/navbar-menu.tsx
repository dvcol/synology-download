import type { JSX } from 'react';

import type { NavbarButton } from '../../models/navbar.model';

import AddLinkIcon from '@mui/icons-material/AddLink';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import { DialogContentText, Divider, IconButton, Menu, Tooltip } from '@mui/material';
import * as React from 'react';
import { use, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { ErrorType, LoginError } from '../../models/error.model';
import { AppLinks } from '../../models/links.model';
import { NavbarButtonType } from '../../models/navbar.model';
import { AppRoute } from '../../models/routes.model';
import { DownloadService } from '../../services/download/download.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PanelService } from '../../services/panel/panel.service';
import { QueryService } from '../../services/query/query.service';
import { resetDownloads } from '../../store/actions/downloads.action';
import { setNavbar } from '../../store/actions/navbar.action';
import { resetTasks } from '../../store/actions/tasks.action';
import { ContainerContext } from '../../store/context/container.context';
import { getGlobalNavbarButton, getSettingsDownloadsButtons, getSettingsDownloadsEnabled, getUrl } from '../../store/selectors/settings.selector';
import { getLogged } from '../../store/selectors/state.selector';
import { createTab } from '../../utils/chrome/chrome.utils';
import { useI18n } from '../../utils/webex.utils';
import { ConfirmationDialog } from '../common/dialog/confirmation-dialog';
import { TooltipHoverChange } from '../common/tooltip/tooltip-hover-change';
import NavbarMenuIcon from './navbar-menu-icon';

interface NavbarMenuProps { menuIcon: React.ReactNode }

export function NavbarMenu({ menuIcon }: NavbarMenuProps) {
  const i18n = useI18n('navbar', 'menu');
  const dispatch = useDispatch();
  const url = useSelector(getUrl) + AppLinks.DownloadStation;
  const navbarButtons = useSelector(getGlobalNavbarButton);
  const logged = useSelector(getLogged);
  const downloadEnabled = useSelector(getSettingsDownloadsEnabled);
  const downloadButtons = useSelector(getSettingsDownloadsButtons);
  const { containerRef } = use(ContainerContext);
  const location = useLocation();

  const [anchorEl, setAnchorEl] = React.useState<undefined | null | Element>(null);
  const open = Boolean(anchorEl);

  const handleClick = <T extends Element>(event: React.MouseEvent<T>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClearTab = () => dispatch(setNavbar());
  const handleUrl = async () => createTab({ url });
  const handleError = (button: string, type: 'task' | 'download' = 'task') => ({
    error: (error: Error & { type?: string }) => {
      if (error instanceof LoginError || ErrorType.Login === error?.type) {
        NotificationService.loginRequired();
      } else if (error) {
        NotificationService.error({
          title: i18n(`${type}_${button}_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
      }
    },
  });

  // buttons helpers
  const getOnClick: <T extends () => void>(callbacks?: { both?: T; shift?: T; alt?: T }) => NonNullable<NavbarButton['onClick']>
    = ({ both, shift, alt } = {}) =>
      ({ altKey, shiftKey }) => {
      // if both are pressed
        if (shiftKey && altKey) both?.();

        // if download disabled, but task enabled fall back and exit
        if (!downloadButtons && logged) return alt?.();
        // if task disabled, but download enabled fall back and exit
        if (!logged && downloadButtons) return shift?.();

        // if download enable and shift, only do download
        if (downloadButtons && !altKey) shift?.();
        // if task enable and alt, only do tasks
        if (logged && !shiftKey) alt?.();
      };

  const getHoverTooltip: (tooltips?: { both?: string; shift?: string; alt?: string; none?: string }) => NonNullable<NavbarButton['hoverTooltip']> = (
    tooltips = {},
  ) => {
    const { both, shift, alt, none } = {
      shift: i18n('tooltip__download'),
      alt: i18n('tooltip__synology'),
      none: i18n('tooltip__synology_download'),
      ...tooltips,
    };
    return ({ altKey, shiftKey }) => {
      // if both are pressed and both exist
      if (both && altKey && shiftKey) return both;

      // if download disabled, but task enabled fall back
      if (!downloadButtons && logged) return alt;
      // if task disabled, but download enabled fall back
      if (!logged && downloadButtons) return shift;

      // if download enable and shift, only do download
      if (downloadButtons && shiftKey && !altKey) return shift;
      // if task enable and alt, only do tasks
      if (logged && altKey && !shiftKey) return alt;

      // else if both pressed or none
      return none;
    };
  };

  const hoverTooltip = getHoverTooltip();

  // Dialog
  const [prompt, setPrompt] = React.useState(false);
  const onErase = <T extends React.MouseEvent>($event: T) =>
    getOnClick({
      shift: () => DownloadService.cancelAll().subscribe(handleError('cancel', 'download')),
      alt: () => QueryService.deleteAllTasks().subscribe(handleError('delete')),
    })($event);

  const isPanel = useMemo(() => location.pathname === AppRoute.Panel, [location.pathname]);

  // Button list
  const buttons: NavbarButton[] = [
    {
      type: NavbarButtonType.Search,
      label: i18n('menu_search'),
      icon: <ManageSearchIcon />,
      color: 'info',
      disabled: !isPanel,
      divider: true,
      onClick: async () => PanelService.focus(),
    },
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
      type: NavbarButtonType.Scrape,
      label: i18n('menu_scrape'),
      icon: <ImageSearchIcon />,
      color: 'secondary',
      component: Link,
      to: AppRoute.Scrape,
      divider: true,
    },
    {
      type: NavbarButtonType.Refresh,
      label: i18n('menu_refresh'),
      icon: <RefreshIcon />,
      onClick: getOnClick({
        both: () => {
          dispatch(resetDownloads());
          dispatch(resetTasks());
          if (downloadButtons) DownloadService.searchAll().subscribe(handleError('refresh', 'download'));
          if (logged) QueryService.listTasks().subscribe(handleError('refresh'));
        },
        shift: () => DownloadService.searchAll().subscribe(handleError('refresh', 'download')),
        alt: () => QueryService.listTasks().subscribe(handleError('refresh')),
      }),
      hoverTooltip: getHoverTooltip({ both: i18n('tooltip__clean') }),
    },
    {
      type: NavbarButtonType.Resume,
      label: i18n('menu_resume'),
      icon: <PlayArrowIcon />,
      color: 'success',
      disabled: !downloadEnabled && !logged,
      onClick: getOnClick({
        shift: () => DownloadService.resumeAll().subscribe(handleError('resume', 'download')),
        alt: () => QueryService.resumeAllTasks().subscribe(handleError('resume')),
      }),
      hoverTooltip,
    },
    {
      type: NavbarButtonType.Pause,
      label: i18n('menu_pause'),
      icon: <PauseIcon />,
      color: 'warning',
      disabled: !downloadEnabled && !logged,
      onClick: getOnClick({
        shift: () => DownloadService.pauseAll().subscribe(handleError('pause', 'download')),
        alt: () => QueryService.pauseAllTasks().subscribe(handleError('pause')),
      }),
      hoverTooltip,
    },
    {
      type: NavbarButtonType.Remove,
      label: i18n('menu_remove'),
      icon: <DeleteSweepIcon />,
      color: 'error',
      disabled: !downloadEnabled && !logged,
      onClick: $event => (logged ? setPrompt(true) : onErase($event)),
      hoverTooltip,
    },
    {
      type: NavbarButtonType.Clear,
      label: i18n('menu_clear'),
      icon: <ClearAllIcon />,
      color: 'primary',
      disabled: !downloadEnabled && !logged,
      onClick: getOnClick({
        both: () => {
          if (downloadButtons) DownloadService.eraseAll().subscribe(handleError('erase', 'download'));
          if (logged) QueryService.deleteFinishedAndErrorTasks().subscribe(handleError('clear'));
        },
        shift: () => DownloadService.eraseAll().subscribe(handleError('erase', 'download')),
        alt: () => QueryService.deleteFinishedTasks().subscribe(handleError('clear')),
      }),
      hoverTooltip: getHoverTooltip({ both: i18n('tooltip__synology_error_finished') }),
      divider: true,
    },
    {
      type: NavbarButtonType.Configs,
      label: i18n('menu_configs'),
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
      onClick: () => DownloadService.show().subscribe(handleError('open', 'download')),
      hide: !downloadEnabled,
      divider: true,
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
      {(logged || downloadEnabled)
        && buttons
          ?.filter(({ type }) => navbarButtons?.includes(type))
          ?.map(({ type, icon, label, hoverTooltip: bHoverTooltip, divider, hide, ..._props }) => (
            <TooltipHoverChange title={label} hoverTooltip={modifiers => (bHoverTooltip ? `${label} ${bHoverTooltip(modifiers)}` : label)} key={type}>
              <span>
                <IconButton id={`${type}-pinned`} aria-controls={`${type}-pinned-button`} {..._props}>
                  {icon}
                </IconButton>
              </span>
            </TooltipHoverChange>
          ))}

      {!logged && (
        <Tooltip arrow title={i18n('menu_login')} key="login" slotProps={{ popper: { disablePortal: true } }}>
          <span>
            <IconButton
              id="login-pinned"
              aria-controls="login-pinned-button"
              color="error"
              component={Link}
              to={AppRoute.Settings}
              onClick={handleClearTab}
            >
              <PowerOffIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      <Tooltip arrow title={i18n('menu_drawer')} slotProps={{ popper: { disablePortal: true } }}>
        <span>
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
        </span>
      </Tooltip>
      <Menu
        id="dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        container={() => containerRef?.current ?? null}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{ list: { 'aria-labelledby': 'dropdown-menu' } }}
        disableScrollLock
      >
        {buttons
          ?.map(({ divider, hide, ..._button }) => {
            const elements: JSX.Element[] = [];
            if (!hide) elements.push(<NavbarMenuIcon key={`${_button.type}-icon`} {..._button} />);
            if (divider) elements.push(<Divider key={`${_button.type}-divider`} />);
            return elements;
          })
          .flat()
          .filter(Boolean)}
      </Menu>

      <ConfirmationDialog
        open={prompt}
        title={i18n('confirmation_title')}
        description={(
          <React.Fragment>
            <DialogContentText id="alert-dialog-description">{i18n('confirmation_line_1')}</DialogContentText>
            <br />
            <DialogContentText id="alert-dialog-description">{i18n('confirmation_line_2')}</DialogContentText>
          </React.Fragment>
        )}
        onCancel={() => setPrompt(false)}
        onConfirm={($event) => {
          setPrompt(false);
          onErase($event);
        }}
        tooltip={{
          hoverTooltip: modifiers => `${i18n('menu_remove')} ${hoverTooltip(modifiers)}`,
          boxProps: { sx: { ml: '0.5rem' } },
        }}
      />
    </React.Fragment>
  );
}

export default NavbarMenu;
