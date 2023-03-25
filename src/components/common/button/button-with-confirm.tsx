import { Button } from '@mui/material';
import React, { useState } from 'react';

import { useI18n } from '@src/utils';

import { ConfirmationDialog } from '../dialog';

import type { ConfirmationDialogProps } from '../dialog';
import type { ButtonProps } from '@mui/material';

import type { FC } from 'react';

type ButtonWithConfirmProps = {
  buttonLabel?: JSX.Element | string;
  buttonProps?: ButtonProps;
  dialogTitle?: ConfirmationDialogProps['title'];
  dialogDescriptions?: ConfirmationDialogProps['description'];
  onButtonClick?: ConfirmationDialogProps['onConfirm'];
  onDialogCancel?: ConfirmationDialogProps['onConfirm'];
  onDialogConfirm?: ConfirmationDialogProps['onConfirm'];
};
export const ButtonWithConfirm: FC<ButtonWithConfirmProps> = ({
  buttonLabel,
  buttonProps,
  dialogTitle,
  dialogDescriptions,
  onButtonClick,
  onDialogCancel,
  onDialogConfirm,
}) => {
  const i18n = useI18n('common', 'dialog', 'confirm');
  // Dialog
  const [prompt, setPrompt] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        sx={{ flex: '0 1 8rem' }}
        {...buttonProps}
        onClick={(...args) => {
          onButtonClick?.(...args);
          setPrompt(current => !current);
        }}
      >
        {buttonLabel}
      </Button>
      <ConfirmationDialog
        open={prompt}
        title={dialogTitle ?? i18n('title')}
        description={dialogDescriptions ?? i18n('description')}
        onCancel={(...args) => {
          onDialogCancel?.(...args);
          setPrompt(current => !current);
        }}
        onConfirm={(...args) => {
          onDialogConfirm?.(...args);
          setPrompt(current => !current);
        }}
      />
    </>
  );
};
