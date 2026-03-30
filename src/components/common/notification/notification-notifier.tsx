import type { SnackbarMessage } from 'notistack';

import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { NotificationService } from '../../../services/notification/notification.service';

const NotifierId = 'synology-download-notification-stack';
const NotifierStyles = '_goober';

function hasNotifierIdInstance(root: ParentNode, id = NotifierId) {
  return root.querySelector(`#${id}`);
};
function createIdentifier(root: ParentNode, id = NotifierId) {
  const styles = document.querySelector(`#${NotifierStyles}`);
  if (styles)root.appendChild(styles);
  else console.warn('Notifier styles not found, notifications may not be styled correctly');
  const notifierDivId = document.createElement('div');
  notifierDivId.id = id;
  notifierDivId.hidden = true;
  notifierDivId.ariaHidden = 'true';
  root.appendChild(notifierDivId);
  return notifierDivId;
}

export function Notifier({ container = document.body }: { container?: HTMLElement }) {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    // disable notification stack if already injected in the page
    if (hasNotifierIdInstance(container)) return;
    // else create identifier
    createIdentifier(container);
    // and subscribe
    const sub = NotificationService.snackNotifications$.subscribe(
      ({ message, options }) => enqueueSnackbar({ ...options, message: message as unknown as SnackbarMessage }),
    );
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- want to run only once for the lifetime of the app
  }, []);
  return null;
}
