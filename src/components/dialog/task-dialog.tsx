import { ChromeMessageType, TaskForm, TaskFormValid } from '../../models';
import { Dialog, DialogContent } from '@mui/material';
import { TaskAdd } from '../panel';
import React, { useEffect } from 'react';
import { onMessage } from '../../utils';
import { PortalProps } from '@mui/base/Portal';
import { NotificationService } from '../../services';
import { taskDialog$ } from '../../pages/content';
import { Subject, takeUntil } from 'rxjs';
import OnClickData = chrome.contextMenus.OnClickData;

export const TaskDialog = ({ container }: React.PropsWithRef<{ container?: PortalProps['container'] }>) => {
  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const onClose = () => {
    setForm(undefined);
    setOpen(false);
  };
  const onFormSubmit = ({ uri, source, destination }: TaskFormValid) => {
    NotificationService.create(uri, source, destination?.path);
    onClose();
  };

  useEffect(() => {
    const abort$ = new Subject<void>();
    onMessage<OnClickData>([ChromeMessageType.popup])
      .pipe(takeUntil(abort$))
      .subscribe(({ message }) => {
        if (message?.payload) {
          const { linkUrl: uri, pageUrl: source } = message.payload;
          setForm({ uri, source });
          setOpen(true);
        }
      });
    taskDialog$.pipe(takeUntil(abort$)).subscribe(({ open: _open, form: _form }) => {
      _form && setForm(_form);
      setOpen(true);
    });
    return () => {
      abort$.next();
      abort$.complete();
    };
  }, []);

  return (
    <Dialog open={open} container={container} fullWidth={true} onClose={onClose} maxWidth={'md'}>
      <DialogContent sx={{ p: '0' }}>
        <TaskAdd form={form} withCancel={true} onFormCancel={onClose} onFormSubmit={onFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};
