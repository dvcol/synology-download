import { FormControl, FormControlLabel, FormControlLabelProps, FormHelperText, Switch, SwitchProps } from '@mui/material';
import React from 'react';
import { Controller, ControllerProps } from 'react-hook-form';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';

export const FormSwitch = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  switchProps,
  formControlLabelProps,
}: {
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  switchProps?: SwitchProps;
  formControlLabelProps?: Omit<FormControlLabelProps, 'control'>;
}) => {
  const render: ControllerProps['render'] = ({ field, fieldState: { invalid, error } }) => {
    const _switchProps: SwitchProps = {
      id: `${controllerProps.name}-switch`,
      checked: field.value,
      sx: { marginLeft: '0' },
      size: 'small',
      onChange: (e) => field.onChange(e.target.checked),
      ...switchProps,
    };
    const _formControlLabelProps: FormControlLabelProps = {
      label: controllerProps.name,
      control: <Switch {...field} {..._switchProps} />,
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
