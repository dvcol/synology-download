import { Grid, TextField } from '@mui/material';

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
  inputFileProps,
}: React.PropsWithChildren<{
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  textFieldProps?: TextFieldProps;
  iconProps?: SvgIconProps;
  inputFileProps?: { split: boolean };
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
      _textFieldProps.type = 'text';
      const UploadButton = <FormInputFile onChange={_textFieldProps.onChange} />;
      if (inputFileProps?.split) {
        _textFieldProps.InputProps = {
          readOnly: true,
          ...(_textFieldProps.InputProps ?? {}),
        };
        return (
          <Grid container direction="column">
            <Grid container direction="row" wrap="nowrap" sx={{ pb: '0.5em', alignItems: 'center' }}>
              <Grid xs={4}>
                <FormInputFile split={true} onChange={_textFieldProps.onChange} />
              </Grid>
              <Grid xs={8}>{children}</Grid>
            </Grid>
            <Grid container direction="row" wrap="nowrap">
              <TextField {...field} {..._textFieldProps} />
            </Grid>
          </Grid>
        );
      }

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
