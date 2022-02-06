import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { NotificationService } from '@src/services';

export const Notifier = () => {
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    NotificationService.snackNotifications$.subscribe(({ message, options }) => enqueueSnackbar(message, options));
  }, []);
  return null;
};
