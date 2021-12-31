import { Slide } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { SnackMessage } from '../../../models';
import { SnackNotificationCard } from './notification-snack';
import { Notifier } from './notification-notifier';

export const NotificationStack = () => {
  return (
    <>
      <style>{'.SnackbarContainer-root {z-index: 2147483647 !important;}'}</style>
      <SnackbarProvider
        // TODO move to custom snack for next notistack version, see https://github.com/iamhosseindhv/notistack/issues/242
        content={(key, message) => <SnackNotificationCard id={key} notification={message as SnackMessage} />}
        TransitionComponent={Slide as React.ComponentType}
      >
        <Notifier />
      </SnackbarProvider>
    </>
  );
};
