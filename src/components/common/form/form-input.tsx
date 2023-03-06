import { Visibility, VisibilityOff } from '@mui/icons-material';

import { IconButton, InputAdornment, TextField } from '@mui/material';

import React, { useState } from 'react';

import { Controller } from 'react-hook-form';

import { useI18n } from '@dvcol/web-extension-utils';

import type { SvgIconProps, TextFieldProps } from '@mui/material';
import type { ControllerProps } from 'react-hook-form';

import type { FieldPath, FieldValues } from 'react-hook-form/dist/types';

export const FormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  textFieldProps,
  iconProps,
  children,
}: React.PropsWithChildren<{
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  textFieldProps?: TextFieldProps;
  iconProps?: SvgIconProps;
}>) => {
  const i18n = useI18n('common', 'form', 'input');
  const [showPassword, setShowPassword] = useState<boolean>();
  const render: ControllerProps['render'] = ({ field, fieldState: { invalid, error } }) => {
    const _textFieldProps: TextFieldProps = {
      id: `${controllerProps.name}-input`,
      error: invalid,
      helperText: error?.message,

      sx: { flex: '1 1 auto' },
      ...textFieldProps,
      onChange: e => {
        field.onChange(e);
        if (textFieldProps?.onChange) textFieldProps.onChange(e);
      },
    };

    if (textFieldProps?.type === 'password') {
      _textFieldProps.type = showPassword ? 'text' : 'password';
      _textFieldProps.InputProps = {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={i18n('toggle_password_visibility')}
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
              sx={{ fontSize: '1.25em' }}
            >
              {showPassword ? <VisibilityOff {...iconProps} /> : <Visibility {...iconProps} />}
            </IconButton>
          </InputAdornment>
        ),
      };
    }
    return (
      <TextField {...field} {..._textFieldProps}>
        {children ?? ''}
      </TextField>
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
};
