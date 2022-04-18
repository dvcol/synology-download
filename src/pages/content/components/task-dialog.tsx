import { Dialog, DialogContent } from '@mui/material';

import React, { useEffect } from 'react';
import { Subject, takeUntil } from 'rxjs';

import { i18n } from '@dvcol/web-extension-utils';

import { TaskAdd } from '@src/components';
import type { ContextMenuOnClickPayload, TaskForm } from '@src/models';
import { ChromeMessageType } from '@src/models';
import { taskDialog$ } from '@src/pages/content/service/dialog.service';
import { NotificationService, QueryService } from '@src/services';
import { onMessage } from '@src/utils';

import type { PortalProps } from '@mui/base/Portal';
import type { FC } from 'react';

export const TaskDialog: FC<{ container?: PortalProps['container'] }> = ({ container }) => {
  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const onClose = () => {
    setForm(undefined);
    setOpen(false);
  };

  useEffect(() => {
    const abort$ = new Subject<void>();
    onMessage<ContextMenuOnClickPayload>([ChromeMessageType.popup])
      .pipe(takeUntil(abort$))
      .subscribe(({ message, sendResponse }) => {
        if (message?.payload) {
          const {
            info: { linkUrl: uri, pageUrl: source },
            menu: { modal, destination },
          } = message.payload;

          if (uri && QueryService.isLoggedIn) {
            if (modal) {
              setForm({ uri, source, destination });
              setOpen(true);
            } else {
              QueryService.createTask(uri, source, destination?.path).subscribe();
            }
          } else if (uri) {
            NotificationService.loginRequired();
          } else {
            NotificationService.error({
              title: i18n('error', 'common'),
              message: i18n('invalid_argument', 'common', 'error'),
            });
          }
        }
        sendResponse();
      });
    taskDialog$.pipe(takeUntil(abort$)).subscribe(({ open: _open, form: _form }) => {
      if (_form) setForm(_form);
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
        <TaskAdd form={form} withCancel={true} onFormCancel={onClose} onFormSubmit={onClose} />
      </DialogContent>
    </Dialog>
  );
};
