import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { Subscription, withLatestFrom } from 'rxjs';

import type { ChromeResponse } from '@dvcol/web-extension-utils';
import { i18n } from '@dvcol/web-extension-utils';

import { MuiIcon } from '@src/components';
import type { InterceptPayload, InterceptResponse, QuickMenu, TaskForm } from '@src/models';
import { ChromeMessageType, MaterialIcon } from '@src/models';
import { anchor$, lastClick$ } from '@src/pages/content/service/anchor.service';
import type { TaskDialogIntercept } from '@src/pages/content/service/dialog.service';
import { taskDialog$ } from '@src/pages/content/service/dialog.service';
import { NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getQuick } from '@src/store/selectors';

import { onMessage } from '@src/utils';

import type { PortalProps } from '@mui/base/Portal';
import type { PopoverProps } from '@mui/material/Popover';
import type { FC } from 'react';

export const QuickMenuDialog: FC<{ container?: PortalProps['container'] }> = ({ container }) => {
  const [_anchor, setAnchor] = React.useState<PopoverProps['anchorEl']>();
  const [_position, setPosition] = React.useState<PopoverProps['anchorPosition'] | undefined>();

  const [_form, setForm] = React.useState<TaskForm>();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const [intercept, setIntercept] = React.useState<TaskDialogIntercept>();

  const onIntercept = (response: ChromeResponse<InterceptResponse>) => {
    if (intercept?.callback) {
      intercept.callback(response);
      setIntercept(undefined);
    }
  };

  const createTask = (form: TaskForm, modal?: boolean) => {
    if (form?.uri && QueryService.isLoggedIn) {
      if (modal) {
        taskDialog$.next({ open: true, form, intercept });
      } else {
        QueryService.createTask(form?.uri, form?.source, form?.destination?.path).subscribe({
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

  const onEvent = (form: TaskForm, anchor?: PopoverProps['anchorEl'], position?: PopoverProps['anchorPosition'], _menus: QuickMenu[] = menus) => {
    if (_menus?.length > 1) {
      setForm(form);
      setAnchor(anchor ?? null);
      setPosition(position);
    } else if (_menus?.length === 1) {
      createTask({ ...form, destination: _menus[0].destination }, _menus[0].modal);
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
            setIntercept({ callback: sendResponse });
            onEvent(message?.payload, resolvedAnchor, resolvedPosition);
          } else {
            sendResponse({ success: false, error: new Error('Missing task form payload.') });
          }
        }),
    );

    return () => subs.unsubscribe();
  }, []);

  const open = Boolean(_position || _anchor);
  const handleClose = (abort = false) => {
    setAnchor(null);
    setPosition(undefined);
    if (abort) onIntercept({ success: true, payload: { aborted: true, message: 'Intercept aborted.' } });
  };
  const handleClick = ({ destination, modal }: QuickMenu) => {
    handleClose();
    createTask({ ..._form, destination }, modal);
  };

  return (
    <Menu
      id="basic-menu"
      anchorEl={_anchor}
      anchorPosition={_position}
      anchorReference={_position ? 'anchorPosition' : 'anchorEl'}
      open={open}
      container={container}
      onClose={() => handleClose(true)}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {menus?.map(m => (
        <MenuItem key={m.id} onClick={() => handleClick(m)}>
          <ListItemIcon>
            <MuiIcon icon={m.icon ?? MaterialIcon.download} props={{ sx: { fontSize: '1.125rem' } }} />
          </ListItemIcon>
          <ListItemText primary={m.title} primaryTypographyProps={{ sx: { fontSize: '0.75rem' } }} />
        </MenuItem>
      ))}
    </Menu>
  );
};
