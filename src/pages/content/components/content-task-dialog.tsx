import React, { useEffect } from 'react';
import { Subject, takeUntil } from 'rxjs';

import { TaskDialog } from '@src/components';
import type { ContextMenuOnClickPayload, InterceptResponse, TaskForm } from '@src/models';
import { ChromeMessageType } from '@src/models';
import type { TaskDialogIntercept } from '@src/pages/content/service/dialog.service';
import { taskDialog$ } from '@src/pages/content/service/dialog.service';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import type { ChromeResponse } from '@src/utils';
import { i18n, onMessage, sendMessage, zIndexMax } from '@src/utils';

import type { PortalProps } from '@mui/base/Portal';
import type { FC } from 'react';

export const ContentTaskDialog: FC<{ container?: PortalProps['container'] }> = ({ container }) => {
  const [form, setForm] = React.useState<TaskForm>();
  const [open, setOpen] = React.useState<boolean>(false);

  const [intercept, setIntercept] = React.useState<TaskDialogIntercept>();
  const onIntercept = (response: ChromeResponse<InterceptResponse>) => {
    if (intercept?.callback) {
      intercept.callback(response);
      setIntercept(undefined);
    }
  };

  const _setOpen = (_open: boolean) => {
    setOpen(_open);
    sendMessage<boolean>({ type: ChromeMessageType.contentDialogOpen, payload: _open }).subscribe({
      error: e => LoggerService.warn('Intercept menu open failed to send.', e),
    });
  };

  const onClose = (aborted = false) => {
    setForm(undefined);
    _setOpen(false);
    onIntercept({ success: true, payload: { aborted, message: aborted ? 'Intercept aborted.' : 'Task created successfully' } });
  };

  useEffect(() => {
    const abort$ = new Subject<void>();
    onMessage<ContextMenuOnClickPayload>([ChromeMessageType.popup])
      .pipe(takeUntil(abort$))
      .subscribe(({ message, sendResponse }) => {
        if (message?.payload) {
          const {
            info: { linkUrl, pageUrl: source, selectionText },
            menu: { modal, destination },
          } = message.payload;

          const uri = linkUrl ?? selectionText;

          if (uri && QueryService.isLoggedIn) {
            if (modal) {
              setForm({ uri, source, destination });
              _setOpen(true);
            } else {
              QueryService.createTask({ url: [uri], destination: destination?.path }, { source }).subscribe();
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

    taskDialog$.pipe(takeUntil(abort$)).subscribe(({ open: _open, form: _form, intercept: _intercept }) => {
      if (_form) setForm(_form);
      if (_intercept) setIntercept(_intercept);
      _setOpen(true);
    });

    return () => {
      abort$.next();
      abort$.complete();
    };
  }, []);

  return (
    <TaskDialog
      open={open}
      taskForm={form}
      container={container}
      dialogProps={{ sx: { zIndex: `${zIndexMax} !important`, fontSize: '16px' } }}
      onClose={() => onClose(true)}
      onCancel={() => onClose(true)}
      onSubmit={() => onClose(false)}
    />
  );
};
