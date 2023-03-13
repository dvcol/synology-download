import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { TooltipHoverChangeProps } from '@src/components/common/tooltip/tooltip-hover-change';
import TooltipHoverChange from '@src/components/common/tooltip/tooltip-hover-change';

import type { ButtonProps } from '@mui/material';

export type ConfirmationDialogProps = {
  open: boolean;
  title?: JSX.Element | string;
  description?: JSX.Element | string;
  tooltip?: TooltipHoverChangeProps;
  onCancel?: ButtonProps['onClick'];
  onConfirm?: ButtonProps['onClick'];
};
export const ConfirmationDialog = ({ open, title, description, tooltip, onCancel, onConfirm }: ConfirmationDialogProps) => {
  const i18n = useI18n('common', 'buttons');

  const onCancelHandler: ButtonProps['onClick'] = $event => {
    onCancel?.($event);
  };
  const onConfirmHandler: ButtonProps['onClick'] = $event => {
    onConfirm?.($event);
  };
  return (
    <Dialog open={open} onClose={onCancelHandler} aria-labelledby="confirm-delete-dialog" maxWidth={'xs'}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent sx={{ whiteSpace: 'pre-line' }}>{description}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancelHandler}>
          {i18n('cancel')}
        </Button>
        {tooltip ? (
          <TooltipHoverChange {...tooltip}>
            <Button variant="outlined" color="error" onClick={onConfirmHandler}>
              {i18n('confirm')}
            </Button>
          </TooltipHoverChange>
        ) : (
          <Button variant="outlined" color="error" onClick={onConfirmHandler}>
            {i18n('confirm')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
