import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ButtonProps } from '@mui/material';

export type ConfirmationDialogProps = {
  open: boolean;
  title?: JSX.Element | string;
  description?: JSX.Element | string;
  onCancel?: ButtonProps['onClick'];
  onConfirm?: ButtonProps['onClick'];
};
export const ConfirmationDialog = ({ open, title, description, onCancel, onConfirm }: ConfirmationDialogProps) => {
  const i18n = useI18n('common', 'buttons');
  const [state, setState] = useState<boolean>(open);

  useEffect(() => setState(open), [open]);

  const onCancelHandler: ButtonProps['onClick'] = $event => {
    onCancel?.($event);
    setState(false);
  };
  const onConfirmHandler: ButtonProps['onClick'] = $event => {
    onConfirm?.($event);
    setState(false);
  };
  return (
    <Dialog open={state} onClose={onCancelHandler} aria-labelledby="confirm-delete-dialog" maxWidth={'xs'}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent sx={{ whiteSpace: 'pre-line' }}>{description}</DialogContent>
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
