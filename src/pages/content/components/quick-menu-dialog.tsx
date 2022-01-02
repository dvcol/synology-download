import React, { useEffect } from 'react';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { anchor$, taskDialog$ } from '../index';
import { PortalProps } from '@mui/base/Portal';
import { QueryService } from '../../../services';
import { MaterialIcon, QuickMenu, TaskForm } from '../../../models';
import { useSelector } from 'react-redux';
import { getQuick, StoreState } from '../../../store';
import { MuiIcon } from '../../../components/ui-element';

export const QuickMenuDialog = ({ container }: React.PropsWithRef<{ container?: PortalProps['container'] }>) => {
  const [_anchor, setAnchor] = React.useState<Element | null>();
  const [_form, setForm] = React.useState<TaskForm>();
  const menus = useSelector<StoreState, QuickMenu[]>(getQuick);

  useEffect(() => {
    const sub = anchor$.subscribe(({ anchor, form }) => {
      if (menus?.length > 1) {
        setForm(form);
        setAnchor(anchor ?? null);
      } else if (menus?.length === 1) {
        createTask({ ...form, destination: menus[0].destination }, menus[0].modal);
      } else {
        createTask(form);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const createTask = (form: TaskForm, modal?: boolean) => {
    console.log(form, modal);
    if (modal) {
      taskDialog$.next({ open: true, form });
    } else if (form?.uri) {
      QueryService.createTask(form?.uri, form?.source, form?.destination?.path).subscribe();
    }
  };

  const open = Boolean(_anchor);
  const handleClose = () => setAnchor(null);
  const handleClick = ({ destination, modal }: QuickMenu) => {
    handleClose();
    createTask({ ..._form, destination }, modal);
  };

  return (
    <Menu
      id="basic-menu"
      anchorEl={_anchor}
      open={open}
      container={container}
      onClose={handleClose}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {menus?.map((m) => (
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
