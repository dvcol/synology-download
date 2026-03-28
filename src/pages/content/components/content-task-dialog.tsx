import type { PortalProps } from '@mui/material/Portal';
import type { FC } from 'react';

import type { ContextMenuOnClickPayload, InterceptResponse, OpenPanelPayload, OpenPopupPayload } from '../../../models/message.model';
import type { TaskForm } from '../../../models/task.model';
import type { ChromeResponse } from '../../../utils/webex.utils';
import type { TaskDialogIntercept } from '../service/dialog.service';

import { zIndexMax } from '@dvcol/web-extension-utils';
import React, { useEffect } from 'react';
import { Subject, takeUntil } from 'rxjs';

import { TaskDialog } from '../../../components/panel/content/task/task-dialog';
import { ChromeMessageType } from '../../../models/message.model';
import { LoggerService } from '../../../services/logger/logger.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { QueryService } from '../../../services/query/query.service';
import { onMessage, sendMessage } from '../../../utils/chrome/chrome-message.utils';
import { i18n } from '../../../utils/webex.utils';
import { taskDialog$ } from '../service/dialog.service';

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
    onMessage<ContextMenuOnClickPayload>([ChromeMessageType.clickMenu])
      .pipe(takeUntil(abort$))
      .subscribe(({ message, sendResponse }) => {
        if (message?.payload) {
          const {
            info: { linkUrl, pageUrl: source, selectionText },
            menu: { modal, popup, panel, destination },
          } = message.payload;

          const uri = linkUrl ?? selectionText;

          if (uri && QueryService.isLoggedIn) {
            if (panel) {
              sendMessage<OpenPanelPayload>({
                type: ChromeMessageType.openTaskPanel,
                payload: { form: { uri, source, destination } },
              }).subscribe();
            } else if (popup) {
              sendMessage<OpenPopupPayload>({
                type: ChromeMessageType.openTaskPopup,
                payload: { form: { uri, source, destination } },
              }).subscribe();
            } else if (modal) {
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
      dialogProps={{
        sx: { zIndex: `${zIndexMax} !important`, fontSize: '16px' },
        PaperProps: {
          sx: {
            borderRadius: '1em',
          },
        },
      }}
      onClose={() => onClose(true)}
      onCancel={() => onClose(true)}
      onSubmit={() => onClose(false)}
    />
  );
};
