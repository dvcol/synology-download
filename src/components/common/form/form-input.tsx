import { TextField } from '@mui/material';

import React, { useState } from 'react';

import { Controller } from 'react-hook-form';

import { FormInputFile } from './form-input-file';

import { FormInputPassword } from './form-input-password';

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
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
        endAdornment: <FormInputPassword iconProps={iconProps} onToggle={show => setShowPassword(show)} />,
        ...(_textFieldProps.InputProps ?? {}),
      };
    } else if (textFieldProps?.type === 'file') {
      const UploadButton = <FormInputFile onChange={_textFieldProps.onChange} />;
      _textFieldProps.type = 'text';
      _textFieldProps.InputProps = {
        startAdornment: UploadButton,
        readOnly: true,
        ...(_textFieldProps.InputProps ?? {}),
      };
    }

    return (
      <TextField {...field} {..._textFieldProps}>
        {children}
      </TextField>
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
};
