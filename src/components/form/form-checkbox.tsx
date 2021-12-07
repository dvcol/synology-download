import { Controller, ControllerProps } from 'react-hook-form';
import { Checkbox, CheckboxProps, FormControl, FormControlLabel, FormControlLabelProps, FormHelperText } from '@mui/material';
import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';

export const FormCheckbox = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  checkboxProps,
  formControlLabelProps,
}: {
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  checkboxProps?: CheckboxProps;
  formControlLabelProps?: Omit<FormControlLabelProps, 'control'>;
}) => {
  const render: ControllerProps['render'] = ({ field, fieldState: { invalid, error } }) => {
    const _checkboxProps: CheckboxProps = {
      id: `${controllerProps.name}-checkbox`,
      checked: field.value,
      sx: { marginLeft: '0' },
      onChange: (e) => field.onChange(e.target.checked),
      ...checkboxProps,
    };
    const _formControlLabelProps: FormControlLabelProps = {
      label: controllerProps.name,
      control: <Checkbox {...field} {..._checkboxProps} />,
      ...formControlLabelProps,
    };
    return (
      <FormControl error={invalid} component="fieldset" variant="standard">
        <FormControlLabel {..._formControlLabelProps} />
        {error?.message && <FormHelperText error={invalid}>{error.message}</FormHelperText>}
      </FormControl>
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
};
