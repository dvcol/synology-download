import { Button, IconButton, Slide } from '@mui/material';
import { SnackbarKey, SnackbarProvider, useSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

export const Notifier = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = (message: string) =>
    enqueueSnackbar(message, {
      preventDuplicate: true,
      variant: 'success',
      autoHideDuration: 3000,
      persist: false,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      TransitionComponent: Slide as React.ComponentType,
    });
  // style={{ zIndex: 2147483647 }} TODO : custom snackbar with collapsible & zindex
  return (
    <Button variant="outlined" color={'primary'} onClick={() => notify('My notification')}>
      Notify
    </Button>
  );
};

export const NotificationStack = () => {
  const ref = React.createRef<SnackbarProvider>();
  const onClickDismiss = (key: SnackbarKey) => () => ref.current?.closeSnackbar(key);

  return (
    <SnackbarProvider
      ref={ref}
      action={(key) => (
        <IconButton onClick={onClickDismiss(key)}>
          <CloseIcon />
        </IconButton>
      )}
    >
      <Notifier />
    </SnackbarProvider>
  );
};
