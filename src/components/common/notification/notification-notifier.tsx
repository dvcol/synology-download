import { useSnackbar } from 'notistack';
import { useEffect } from 'react';

import { NotificationService } from '@src/services';

const NotifierId = 'synology-download-notification-stack';

const hasNotifierIdInstance = (id = NotifierId) => document.querySelector(`#${id}`);
const createIdentifier = (id = NotifierId) => {
  const notifierDivId = document.createElement('div');
  notifierDivId.id = id;
  notifierDivId.hidden = true;
  notifierDivId.ariaHidden = 'true';
  document.body.appendChild(notifierDivId);
  return notifierDivId;
};

export const Notifier = () => {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    // disable notification stack if already injected in the page
    if (hasNotifierIdInstance()) return;
    // else create identifier
    createIdentifier();
    // and subscribe
    NotificationService.snackNotifications$.subscribe(({ message, options }) => enqueueSnackbar(message, options));
  }, []);
  return null;
};
