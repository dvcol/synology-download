import { IconButton, InputAdornment, SvgIconProps, TextField, TextFieldProps } from '@mui/material';
import { Controller, ControllerProps } from 'react-hook-form';
import React, { useState } from 'react';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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
  const [showPassword, setShowPassword] = useState<boolean>();
  const render: ControllerProps['render'] = ({ field, fieldState: { invalid, error } }) => {
    const _textFieldProps: TextFieldProps = {
      id: `${controllerProps.name}-input`,
      error: invalid,
      helperText: error?.message,

      sx: { flex: '1 1 auto' },
      ...textFieldProps,
      onChange: (e) => {
        field.onChange(e);
        if (textFieldProps?.onChange) textFieldProps.onChange(e);
      },
    };

    if (textFieldProps?.type === 'password') {
      _textFieldProps.type = showPassword ? 'text' : 'password';
      _textFieldProps.InputProps = {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
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
