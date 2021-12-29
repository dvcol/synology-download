import { ChromeMessageType } from '../../models';
import { Dialog, DialogContent } from '@mui/material';
import { TaskAdd, TaskForm } from '../panel';
import React, { useEffect } from 'react';
import { onMessage } from '../../utils';
import { PortalProps } from '@mui/base/Portal';
import OnClickData = chrome.contextMenus.OnClickData;

export const TaskDialog = ({ container }: React.PropsWithRef<{ container?: PortalProps['container'] }>) => {
  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const onFormCancel = () => {
    console.log('cancel form');
    setOpen(false);
  };
  const onFormSubmit = () => {
    setOpen(false);
    console.log('submitted form');
  };

  useEffect(() => {
    onMessage<OnClickData>([ChromeMessageType.popup]).subscribe(({ message }) => {
      console.log('open modal', message);
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
