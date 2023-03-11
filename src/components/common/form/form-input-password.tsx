import { Visibility, VisibilityOff } from '@mui/icons-material';

import { IconButton, InputAdornment } from '@mui/material';

import React, { useState } from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

import type { SvgIconProps } from '@mui/material';
import type { FC, PropsWithChildren } from 'react';

export const FormInputPassword: FC<
  PropsWithChildren<{
    onToggle: (show: boolean) => void;
    iconProps?: SvgIconProps;
  }>
> = ({ iconProps, onToggle }) => {
  const i18n = useI18n('common', 'form', 'input');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <InputAdornment position="end">
      <IconButton
        aria-label={i18n('toggle_password_visibility')}
        onClick={() =>
          setShowPassword(show => {
            onToggle(!show);
            return !show;
          })
        }
        edge="end"
        sx={{ fontSize: '1.25em' }}
      >
        {showPassword ? <VisibilityOff {...iconProps} /> : <Visibility {...iconProps} />}
      </IconButton>
    </InputAdornment>
  );
};
