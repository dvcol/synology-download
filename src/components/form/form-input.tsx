import { TextField, TextFieldProps } from '@mui/material';
import { Controller, ControllerProps } from 'react-hook-form';
import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';

export const FormInput = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  textFieldProps,
  children,
}: React.PropsWithChildren<{
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  textFieldProps?: TextFieldProps;
}>) => {
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
    return (
      <TextField {...field} {..._textFieldProps}>
        {children ?? ''}
      </TextField>
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
};
