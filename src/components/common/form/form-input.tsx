import type { SvgIconProps, TextFieldProps } from '@mui/material';
import type { PropsWithChildren } from 'react';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import type { FormInputFileProps } from './form-input-file';

import { Grid, TextField } from '@mui/material';
import { use, useState } from 'react';
import { Controller } from 'react-hook-form';

import { ContainerContext } from '../../../store/context/container.context';
import { FormInputFile } from './form-input-file';
import { FormInputPassword } from './form-input-password';

export function FormInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  textFieldProps,
  iconProps,
  children,
  inputFileProps,
}: PropsWithChildren<{
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render' | 'control'> & { control?: unknown };
  textFieldProps?: TextFieldProps;
  iconProps?: SvgIconProps;
  inputFileProps?: Omit<FormInputFileProps, 'onChange'>;
}>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { containerRef } = use(ContainerContext);

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
      _textFieldProps.slotProps = {
        ...(_textFieldProps.slotProps ?? {}),
        input: { endAdornment: <FormInputPassword iconProps={iconProps} onToggle={show => setShowPassword(show)} />, ...(_textFieldProps.slotProps?.input ?? {}) },
      };
    } else if (textFieldProps?.type === 'file') {
      _textFieldProps.type = 'text';
      const UploadButton = <FormInputFile split={inputFileProps?.split} accept={inputFileProps?.accept} onChange={_textFieldProps.onChange} />;
      if (inputFileProps?.split) {
        _textFieldProps.slotProps = {
          ...(_textFieldProps.slotProps ?? {}),
          input: { readOnly: true, ...(_textFieldProps.slotProps?.input ?? {}) },
        };
        return (
          <Grid container direction="column">
            <Grid container direction="row" wrap="nowrap" sx={{ mb: '0.75em', alignItems: 'center' }}>
              <Grid size={4}>
                {UploadButton}
              </Grid>
              <Grid size={8}>
                {children}
              </Grid>
            </Grid>
            <Grid container direction="row" wrap="nowrap">
              <TextField fullWidth {...field} {..._textFieldProps} />
            </Grid>
          </Grid>
        );
      }

      _textFieldProps.slotProps = {
        ...(_textFieldProps.slotProps ?? {}),
        input: { startAdornment: UploadButton, readOnly: true, ...(_textFieldProps.slotProps?.input ?? {}) },
      };
    }

    _textFieldProps.slotProps = {
      ...(_textFieldProps.slotProps ?? {}),
      select: { MenuProps: { container: containerRef?.current } },
    };

    return (
      <TextField {...field} {..._textFieldProps}>
        {children}
      </TextField>
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
}
