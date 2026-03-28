import type { CheckboxProps, FormControlLabelProps } from '@mui/material';
import type { DefaultComponentProps, OverridableTypeMap } from '@mui/material/OverridableComponent';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import { Checkbox, FormControl, FormControlLabel, FormHelperText } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

function stringifyIncludes(array?: (boolean | string)[], value?: boolean | string): boolean {
  return array?.map(v => JSON.stringify(v)).includes(JSON.stringify(value)) ?? false;
}

export function FormCheckbox<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  checkboxProps,
  formControlProps,
  formControlLabelProps,
}: {
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  checkboxProps?: CheckboxProps & { multiple?: boolean; value?: CheckboxProps['checked'] };
  formControlProps?: DefaultComponentProps<OverridableTypeMap>;
  formControlLabelProps?: Omit<FormControlLabelProps, 'control'>;
}) {
  const render: ControllerProps<TFieldValues, TName>['render'] = ({ field, fieldState: { invalid, error } }) => {
    const checked: CheckboxProps['checked'] = checkboxProps?.multiple
      ? stringifyIncludes(field.value, checkboxProps?.value)
      : field.value;
    const onChange: CheckboxProps['onChange'] = checkboxProps?.multiple
      ? (event, _checked) => {
          if (_checked) {
            field.onChange([...field.value, JSON.parse(event.target.value)]);
          } else {
            field.onChange((field.value as string[]).filter((_value: string) => JSON.stringify(_value) !== event.target.value));
          }
        }
      : e => field.onChange(e.target.checked);

    const _checkboxProps: CheckboxProps = {
      id: `${controllerProps.name}-checkbox`,
      checked,
      sx: { marginLeft: '0' },
      ...checkboxProps,
      value: checkboxProps?.value ? JSON.stringify(checkboxProps.value) : checkboxProps?.value,
      onChange: (event, _checked) => {
        onChange(event, _checked);
        if (checkboxProps?.onChange) checkboxProps?.onChange(event, _checked);
      },
    };

    const _formControlLabelProps: FormControlLabelProps = {
      label: controllerProps.name,
      control: <Checkbox {...field} {..._checkboxProps} />,
      ...formControlLabelProps,
    };
    return (
      <FormControl
        key={checkboxProps?.multiple ? JSON.stringify(checkboxProps.value) : undefined}
        error={invalid}
        component="fieldset"
        variant="standard"
        {...formControlProps}
      >
        <FormControlLabel {..._formControlLabelProps} />
        {!!error?.message && <FormHelperText error={invalid}>{error.message}</FormHelperText>}
      </FormControl>
    );
  };

  const _controllerProps = { ...controllerProps, render };
  return <Controller {..._controllerProps} />;
}
