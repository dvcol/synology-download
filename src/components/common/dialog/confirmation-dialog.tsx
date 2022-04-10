import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import React, { useEffect } from 'react';

import { useI18n } from '@src/utils';

export const ConfirmationDialog = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: JSX.Element | string;
  description?: JSX.Element | string;
  onCancel?: ($event: React.MouseEvent) => void;
  onConfirm?: ($event: React.MouseEvent) => void;
}) => {
  const i18n = useI18n('common', 'buttons');
  const [state, setState] = React.useState(open);

  useEffect(() => setState(open), [open]);

  const onCancelHandler = ($event: React.MouseEvent) => {
    onCancel?.($event);
    setState(false);
  };
  const onConfirmHandler = ($event: React.MouseEvent) => {
    onConfirm?.($event);
    setState(false);
  };
  return (
    <Dialog open={state} onClose={onCancelHandler} aria-labelledby="confirm-delete-dialog" maxWidth={'xs'}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>{description}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancelHandler}>
          {i18n('cancel')}
        </Button>
        <Button variant="outlined" color="error" onClick={onConfirmHandler}>
          {i18n('confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
