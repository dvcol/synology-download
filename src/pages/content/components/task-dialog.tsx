import { ChromeMessageType, ContextMenuOnClickPayload, TaskForm, TaskFormValid } from '@src/models';
import { Dialog, DialogContent } from '@mui/material';
import { TaskAdd } from '@src/components';
import React, { useEffect } from 'react';
import { onMessage } from '@src/utils';
import { PortalProps } from '@mui/base/Portal';
import { NotificationService, QueryService } from '@src/services';
import { taskDialog$ } from '../index';
import { Subject, takeUntil } from 'rxjs';

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
    onMessage<ContextMenuOnClickPayload>([ChromeMessageType.popup], true)
      .pipe(takeUntil(abort$))
      .subscribe(({ message, sendResponse }) => {
        if (message?.payload) {
          const {
            info: { linkUrl: uri, pageUrl: source },
            menu: { modal, destination },
          } = message.payload;

          if (modal) {
            setForm({ uri, source, destination });
            setOpen(true);
          } else if (uri) {
            QueryService.createTask(uri, source, destination?.path).subscribe();
          }
        }
        sendResponse();
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