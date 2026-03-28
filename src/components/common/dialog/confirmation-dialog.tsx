import type { ButtonProps } from '@mui/material';

import type { TooltipHoverChangeProps } from '../tooltip/tooltip-hover-change';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import React, { useContext } from 'react';

import { ContainerContext } from '../../../store/context/container.context';
import { useI18n } from '../../../utils/webex.utils';
import TooltipHoverChange from '../tooltip/tooltip-hover-change';

export interface ConfirmationDialogProps {
  open: boolean;
  title?: JSX.Element | string;
  description?: JSX.Element | string;
  tooltip?: TooltipHoverChangeProps;
  onCancel?: ButtonProps['onClick'];
  onConfirm?: ButtonProps['onClick'];
}
export function ConfirmationDialog({ open, title, description, tooltip, onCancel, onConfirm }: ConfirmationDialogProps) {
  const i18n = useI18n('common', 'buttons');
  const { containerRef } = useContext(ContainerContext);

  function getContainerRef() {
    return containerRef?.current ?? null;
  }

  const onCancelHandler: ButtonProps['onClick'] = ($event) => {
    onCancel?.($event);
  };
  const onConfirmHandler: ButtonProps['onClick'] = ($event) => {
    onConfirm?.($event);
  };
  return (
    <Dialog open={open} onClose={onCancelHandler} aria-labelledby="confirm-delete-dialog" maxWidth="xs" container={getContainerRef}>
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent sx={{ whiteSpace: 'pre-line' }}>{description}</DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onCancelHandler}>
          {i18n('cancel')}
        </Button>
        {tooltip
          ? (
              <TooltipHoverChange {...tooltip}>
                <Button variant="outlined" color="error" onClick={onConfirmHandler}>
                  {i18n('confirm')}
                </Button>
              </TooltipHoverChange>
            )
          : (
              <Button variant="outlined" color="error" onClick={onConfirmHandler}>
                {i18n('confirm')}
              </Button>
            )}
      </DialogActions>
    </Dialog>
  );
}
