import { ChromeMessageType } from '../../models';
import { Dialog, DialogContent } from '@mui/material';
import { TaskAdd, TaskForm } from '../panel';
import React, { useEffect } from 'react';
import { onMessage } from '../../utils';
import { PortalProps } from '@mui/base/Portal';
import { NotificationService } from '../../services';
import OnClickData = chrome.contextMenus.OnClickData;

export const TaskDialog = ({ container }: React.PropsWithRef<{ container?: PortalProps['container'] }>) => {
  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const onFormCancel = (_form: TaskForm) => setOpen(false);
  const onFormSubmit = ({ uri, source, destination }: TaskForm & { uri: string }) => {
    setOpen(false);
    NotificationService.create(uri, source, destination?.path);
  };

  useEffect(() => {
    onMessage<OnClickData>([ChromeMessageType.popup]).subscribe(({ message }) => {
      if (message?.payload) {
        const { linkUrl: uri, pageUrl: source } = message.payload;
        setForm({ uri, source });
        setOpen(true);
      }
    });
  }, []);

  return (
    <Dialog open={open} container={container} fullWidth={true} onClose={() => setOpen(false)} maxWidth={'md'}>
      <DialogContent sx={{ p: '0' }}>
        <TaskAdd form={form} withCancel={true} onFormCancel={onFormCancel} onFormSubmit={onFormSubmit} />
      </DialogContent>
    </Dialog>
  );
};
