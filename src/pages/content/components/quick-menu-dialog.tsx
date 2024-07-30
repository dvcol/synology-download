import PowerOffIcon from '@mui/icons-material/PowerOff';

import { ListItemText, Menu, MenuItem } from '@mui/material';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Subscription, withLatestFrom } from 'rxjs';

import { zIndexMax } from '@dvcol/web-extension-utils';

import type { InterceptPayload, InterceptResponse, QuickMenu, TaskForm } from '@src/models';
import { ChromeMessageType, ColorLevel, QuickMenuType } from '@src/models';

import { anchor$, lastClick$ } from '@src/pages/content/service/anchor.service';
import type { TaskDialogIntercept } from '@src/pages/content/service/dialog.service';
import { taskDialog$ } from '@src/pages/content/service/dialog.service';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getDestinationsHistory, getFolderHistory, getLogged, getQuick } from '@src/store/selectors';
import type { ChromeResponse } from '@src/utils';
import { onMessage, sendMessage, useI18n } from '@src/utils';

import { QuickMenuRecent } from './quick-menu-recent';

import type { PopoverProps, PortalProps } from '@mui/material';
import type { FC } from 'react';

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

  let callback: TaskDialogIntercept['callback']; // fallback for when we respond before react setState
  const [intercept, setIntercept] = React.useState<TaskDialogIntercept>();
  const _menus = menus?.filter(m => !!intercept || ![QuickMenuType.Download, QuickMenuType.RecentDownload].includes(m.type));

  const onIntercept = (response: ChromeResponse<InterceptResponse>) => {
    const _callback = intercept?.callback ?? callback;
    if (_callback) {
      _callback(response);
      setIntercept(undefined);
    }
  };

  const createTask = (form: TaskForm, modal?: boolean) => {
    if (form?.uri && QueryService.isLoggedIn) {
      if (modal) {
        taskDialog$.next({ open: true, form, intercept });
      } else {
        QueryService.createTask({ url: [form?.uri], destination: form?.destination?.path }, { source: form?.source }).subscribe({
          error: error => onIntercept({ success: false, error }),
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
  };

  const handleClose = (response?: InterceptResponse) => {
    setState(null, undefined);
    if (response) onIntercept({ success: true, payload: response });
  };

  const handleClick = ({ destination, modal, type, id }: QuickMenu, path?: string) => {
    if (type === QuickMenuType.Download) return handleClose({ aborted: true, resume: true, message: `Quick menu '${id}' clicked.` });
    if (type === QuickMenuType.RecentDownload)
      return handleClose({
        aborted: true,
        resume: true,
        message: `Quick menu '${id}' clicked with folder '${path}'.`,
        folder: path,
      });
    handleClose();
    const _destination: QuickMenu['destination'] = path ? { custom: true, path } : destination;
    createTask({ ..._form, destination: _destination }, modal);
  };

  const onEvent = (
    form: TaskForm,
    anchor?: PopoverProps['anchorEl'],
    position?: PopoverProps['anchorPosition'],
    quickMenus: QuickMenu[] = _menus,
  ) => {
    if (quickMenus?.length > 1) {
      setForm(form);
      setState(anchor ?? null, position);
    } else if (quickMenus?.length === 1) {
      createTask({ ...form, destination: quickMenus[0].destination }, quickMenus[0].modal);
    } else {
      createTask(form);
    }
  };

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
            callback = sendResponse;
            setIntercept({ callback: sendResponse });
            onEvent(message?.payload, resolvedAnchor, resolvedPosition);
          } else {
            sendResponse({ success: false, error: new Error('Missing task form payload.') });
          }
        }),
    );

    return () => subs.unsubscribe();
  }, []);

  const destinations = useSelector<StoreState, string[]>(getDestinationsHistory);
  const folders = useSelector<StoreState, string[]>(getFolderHistory);
  const logged = useSelector<StoreState, boolean>(getLogged);

  return (
    <Menu
      id="basic-menu"
      anchorEl={_anchor}
      anchorPosition={_position}
      anchorReference={_position ? 'anchorPosition' : 'anchorEl'}
      open={open}
      container={container}
      onClose={() => handleClose({ aborted: true, message: `Quick menu cancelled.` })}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
      sx={{ zIndex: `${zIndexMax} !important` }}
      disableScrollLock
    >
      {!isLogged && (
        <MenuItem sx={{ fontSize: '1em' }} disableRipple disableTouchRipple>
          <PowerOffIcon color={ColorLevel.error} sx={{ fontSize: '0.875em', width: '1.25em', height: '1.25em' }} />
          <ListItemText primary={i18n('disconnected')} primaryTypographyProps={{ sx: { fontSize: '0.75em', ml: '0.75em' } }} />
        </MenuItem>
      )}
      {_menus?.map(m => (
        <QuickMenuRecent
          key={m.id}
          menu={m}
          logged={logged}
          folders={folders}
          destinations={destinations}
          onClick={(_, { menu, destination }) => handleClick(menu, destination)}
        />
      ))}
    </Menu>
  );
};
