import type { PopoverProps, PortalProps } from '@mui/material';
import type { FC } from 'react';

import type { QuickMenu } from '../../../models/menu.model';
import type { InterceptPayload, InterceptResponse, OpenPanelPayload, OpenPopupPayload } from '../../../models/message.model';
import type { ThemeMode } from '../../../models/settings.model';
import type { TaskForm } from '../../../models/task.model';
import type { StoreState } from '../../../store/store';
import type { ChromeResponse } from '../../../utils/webex.utils';
import type { TaskDialogIntercept } from '../service/dialog.service';

import { zIndexMax } from '@dvcol/web-extension-utils';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import { ListItemText, Menu, MenuItem } from '@mui/material';
import * as React from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Subscription, withLatestFrom } from 'rxjs';

import { ColorLevel } from '../../../models/material-ui.model';
import { QuickMenuType } from '../../../models/menu.model';
import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { QueryService } from '../../../services/query/query.service';
import { getQuick, getThemeMode } from '../../../store/selectors/settings.selector';
import { getDestinationsHistory, getFolderHistory, getLogged } from '../../../store/selectors/state.selector';
import { preferDark } from '../../../themes/media-query';
import { onMessage, sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { useI18n } from '../../../utils/webex.utils';
import { anchor$, lastClick$ } from '../service/anchor.service';
import { taskDialog$ } from '../service/dialog.service';
import { QuickMenuRecent } from './quick-menu-recent';

export const QuickMenuDialog: FC<{ container?: PortalProps['container'] }> = ({ container }) => {
  const i18n = useI18n('content', 'quick_menu', 'dialog');
  const [_anchor, setAnchor] = React.useState<PopoverProps['anchorEl']>();
  const [_position, setPosition] = React.useState<PopoverProps['anchorPosition'] | undefined>();

  const open = Boolean(_position || _anchor);

  const setState = (anchor?: PopoverProps['anchorEl'], position?: PopoverProps['anchorPosition']) => {
    setAnchor(anchor ?? null);
    setPosition(position);
    sendMessage<boolean>({ type: ChromeMessageType.contentMenuOpen, payload: Boolean(position || anchor) }).subscribe({
      error: e => LoggerService.warn('Intercept menu open failed to send.', e),
    });
  };

  const [_form, setForm] = React.useState<TaskForm>();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const isLogged = useSelector<StoreState, boolean>(getLogged);

  const callback = useRef<TaskDialogIntercept['callback']>(undefined);
  const [intercept, setIntercept] = React.useState<TaskDialogIntercept>();
  const _menus = menus?.filter(m => !!intercept || ![QuickMenuType.Download, QuickMenuType.RecentDownload].includes(m.type));

  const onIntercept = useCallback((response: ChromeResponse<InterceptResponse>) => {
    const _callback = intercept?.callback ?? callback.current;
    if (_callback) {
      _callback(response);
      setIntercept(undefined);
    }
  }, [intercept]);

  const createTask = useCallback((form: TaskForm, { modal, popup, panel }: { modal?: boolean; popup?: boolean; panel?: boolean } = {}) => {
    if (form?.uri && QueryService.isLoggedIn) {
      if (panel) {
        sendMessage<OpenPanelPayload>({
          type: ChromeMessageType.openTaskPanel,
          payload: { form, intercept },
        }).subscribe();
      } else if (popup) {
        sendMessage<OpenPopupPayload>({
          type: ChromeMessageType.openTaskPopup,
          payload: { form, intercept },
        }).subscribe();
      } else if (modal) {
        taskDialog$.next({ open: true, form, intercept });
      } else {
        QueryService.createTask({ url: [form?.uri], destination: form?.destination?.path }, { source: form?.source }).subscribe({
          error: (error: Error) => onIntercept({ success: false, error }),
          next: () => onIntercept({ success: true, payload: { aborted: false, message: 'Task created successfully' } }),
        });
      }
    } else if (form?.uri) {
      NotificationService.loginRequired();
      onIntercept({ success: false, error: new Error('Login is required') });
    } else {
      NotificationService.error({
        title: i18n('error', 'common'),
        message: i18n('invalid_argument', 'common', 'error'),
      });
      onIntercept({ success: false, error: new Error('Invalid arguments') });
    }
  }, [intercept, onIntercept, i18n]);

  const handleClose = (response?: InterceptResponse) => {
    setState(null, undefined);
    if (response) onIntercept({ success: true, payload: response });
  };

  const handleClick = ({ destination, modal, popup, panel, type, id }: QuickMenu, path?: string) => {
    if (type === QuickMenuType.Download) return handleClose({ aborted: true, resume: true, message: `Quick menu '${id}' clicked.` });
    if (type === QuickMenuType.RecentDownload) {
      return handleClose({
        aborted: true,
        resume: true,
        message: `Quick menu '${id}' clicked with folder '${path}'.`,
        folder: path,
      });
    }
    handleClose();
    const _destination: QuickMenu['destination'] = path ? { custom: true, path } : destination;
    createTask({ ..._form, destination: _destination }, { modal, popup, panel });
  };

  const onEvent = useCallback((
    form: TaskForm,
    anchor?: PopoverProps['anchorEl'],
    position?: PopoverProps['anchorPosition'],
    quickMenus: QuickMenu[] = _menus,
  ) => {
    if (quickMenus?.length > 1) {
      setForm(form);
      setState(anchor ?? null, position);
    } else if (quickMenus?.length === 1) {
      const { modal, popup, panel, destination } = quickMenus[0];
      createTask({ ...form, destination }, { modal, popup, panel });
    } else {
      createTask(form);
    }
  }, [_menus, createTask]);

  useEffect(() => {
    const subs = new Subscription();
    subs.add(
      anchor$.subscribe(({ event, anchor, form }) => {
        const resolvedPosition = event ? { top: event.clientY, left: event.clientX } : undefined;
        const resolvedAnchor = event ? null : anchor ?? null;
        onEvent(form, resolvedAnchor, resolvedPosition);
      }),
    );

    subs.add(
      onMessage<InterceptPayload>([ChromeMessageType.intercept])
        .pipe(withLatestFrom(lastClick$))
        .subscribe(([{ message, sendResponse }, { event, anchor }]) => {
          const resolvedPosition = event ? { top: event.clientY, left: event.clientX } : undefined;
          const resolvedAnchor = event ? null : anchor ?? null;

          if (message?.payload) {
            callback.current = sendResponse;
            setIntercept({ callback: sendResponse });
            onEvent(message?.payload, resolvedAnchor, resolvedPosition);
          } else {
            sendResponse({ success: false, error: new Error('Missing task form payload.') });
          }
        }),
    );

    return () => subs.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- want to run only once for the lifetime of the component
  }, []);

  const destinations = useSelector<StoreState, string[]>(getDestinationsHistory);
  const folders = useSelector<StoreState, string[]>(getFolderHistory);
  const logged = useSelector<StoreState, boolean>(getLogged);
  const theme = useSelector<StoreState, ThemeMode>(getThemeMode);
  const isDark = preferDark(theme);

  return (
    <Menu
      id="basic-menu"
      anchorEl={_anchor}
      anchorPosition={_position}
      anchorReference={_position ? 'anchorPosition' : 'anchorEl'}
      open={open}
      container={container}
      onClose={() => handleClose({ aborted: true, message: 'Quick menu cancelled.' })}
      slotProps={{
        list: {
          'aria-labelledby': 'basic-button',
        },
        paper: {
          sx: {
            borderRadius: '1em',
            backgroundColor: isDark ? 'rgb(5 5 10 / 0.75)' : 'rgba(234 238 242 / 0.75)',
            backdropFilter: 'blur(3px)',
            boxShadow: 'rgba(0, 0, 0, 0.3) 2px 3px 4px 0px',
          },
        },
      }}
      sx={{ zIndex: `${zIndexMax} !important` }}
      disableScrollLock
    >
      {!isLogged && (
        <MenuItem sx={{ fontSize: '1em' }} disableRipple disableTouchRipple>
          <PowerOffIcon color={ColorLevel.error} sx={{ fontSize: '0.875em', width: '1.25em', height: '1.25em' }} />
          <ListItemText primary={i18n('disconnected')} slotProps={{ primary: { sx: { fontSize: '0.75em', ml: '0.75em' } } }} />
        </MenuItem>
      )}
      {_menus?.map(m => (
        <QuickMenuRecent
          key={m.id}
          menu={m}
          isDark={isDark}
          logged={logged}
          folders={folders}
          destinations={destinations}
          onClick={(_, { menu, destination }) => handleClick(menu, destination)}
          onToggle={(_, _open) => {
            if (!_open) return;
            // If the menu is opened, we need to trigger a resize event to ensure the menu is positioned correctly
            window.dispatchEvent(new CustomEvent('resize'));
          }}
        />
      ))}
    </Menu>
  );
};
