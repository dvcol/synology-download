import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useEffect } from 'react';

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
  const [state, setState] = React.useState(open);

  useEffect(() => setState(open), [open]);

  const onCancelHandler = ($event: React.MouseEvent) => {
    onCancel && onCancel($event);
    setState(false);
  };
  const onConfirmHandler = ($event: React.MouseEvent) => {
    onConfirm && onConfirm($event);
    setState(false);
  };
  return (
    <Dialog open={state} onClose={() => setState(false)} aria-labelledby="confirm-delete-dialog" maxWidth={'xs'}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>{description}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancelHandler}>
          Cancel
        </Button>
        <Button variant="outlined" color="error" onClick={onConfirmHandler} autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
