import type { SnackbarMessage } from 'notistack';

import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { NotificationService } from '../../../services/notification/notification.service';

const NotifierId = 'synology-download-notification-stack';

const hasNotifierIdInstance = (id = NotifierId) => document.querySelector(`#${id}`);
function createIdentifier(id = NotifierId) {
  const notifierDivId = document.createElement('div');
  notifierDivId.id = id;
  notifierDivId.hidden = true;
  notifierDivId.ariaHidden = 'true';
  document.body.appendChild(notifierDivId);
  return notifierDivId;
}

export function Notifier() {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    // disable notification stack if already injected in the page
    if (hasNotifierIdInstance()) return;
    // else create identifier
    createIdentifier();
    // and subscribe
    const sub = NotificationService.snackNotifications$.subscribe(({ message, options }) => enqueueSnackbar(message as unknown as SnackbarMessage, options));
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- want to run only once for the lifetime of the app
  }, []);
  return null;
}
