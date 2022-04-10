import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';

import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';

import { MuiIcon } from '@src/components';
import type { QuickMenu, TaskForm } from '@src/models';
import { MaterialIcon } from '@src/models';
import { anchor$ } from '@src/pages/content/service/anchor.service';
import { taskDialog$ } from '@src/pages/content/service/dialog.service';
import { NotificationService, QueryService } from '@src/services';
import type { StoreState } from '@src/store';
import { getQuick } from '@src/store/selectors';

import { i18n } from '@src/utils';

import type { PortalProps } from '@mui/base/Portal';
import type { PopoverProps } from '@mui/material/Popover';
import type { FC } from 'react';

export const QuickMenuDialog: FC<{ container?: PortalProps['container'] }> = ({ container }) => {
  const [_anchor, setAnchor] = React.useState<PopoverProps['anchorEl']>();
  const [position, setPosition] = React.useState<PopoverProps['anchorPosition'] | undefined>();

  const [_form, setForm] = React.useState<TaskForm>();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  const createTask = (form: TaskForm, modal?: boolean) => {
    if (form?.uri && QueryService.isLoggedIn) {
      if (modal) {
        taskDialog$.next({ open: true, form });
      } else {
        QueryService.createTask(form?.uri, form?.source, form?.destination?.path).subscribe();
      }
    } else if (form?.uri) {
      NotificationService.loginRequired();
    } else {
      NotificationService.error({
        title: i18n('error', 'common'),
        message: i18n('invalid_argument', 'common', 'error'),
      });
    }
  };

  useEffect(() => {
    const sub = anchor$.subscribe(({ event, anchor, form }) => {
      if (menus?.length > 1) {
        setForm(form);
        setAnchor(event ? null : anchor ?? null);
        setPosition(event ? { top: event.clientY, left: event.clientX } : undefined);
      } else if (menus?.length === 1) {
        createTask({ ...form, destination: menus[0].destination }, menus[0].modal);
      } else {
        createTask(form);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const open = Boolean(position || _anchor);
  const handleClose = () => {
    setAnchor(null);
    setPosition(undefined);
  };
  const handleClick = ({ destination, modal }: QuickMenu) => {
    handleClose();
    createTask({ ..._form, destination }, modal);
  };

  return (
    <Menu
      id="basic-menu"
      anchorEl={_anchor}
      anchorPosition={position}
      anchorReference={position ? 'anchorPosition' : 'anchorEl'}
      open={open}
      container={container}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {menus?.map(m => (
        <MenuItem key={m.id} onClick={() => handleClick(m)}>
          <ListItemIcon>
            <MuiIcon icon={m.icon ?? MaterialIcon.download} props={{ sx: { fontSize: '18px' } }} />
          </ListItemIcon>
          <ListItemText primary={m.title} primaryTypographyProps={{ sx: { fontSize: '12px' } }} />
        </MenuItem>
      ))}
    </Menu>
  );
};
