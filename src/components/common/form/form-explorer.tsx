import { Controller, ControllerProps } from 'react-hook-form';
import React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form/dist/types';
import { Explorer, ExplorerEvent, ExplorerProps } from '@src/components';

export const FormExplorer = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  controllerProps,
  explorerProps,
  onChange,
}: React.PropsWithoutRef<{
  controllerProps: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  explorerProps?: Omit<ExplorerProps, 'onChange'>;
  onChange?: (event: ExplorerEvent) => void;
}>) => {
  const render: ControllerProps['render'] = ({ field: { onChange: _onChange, value } }) => {
    return (
      <Explorer
        onChange={({ id, path, folder }) => {
          onChange && onChange({ id, path, folder });
          _onChange(path);
        }}
        {...explorerProps}
      />
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
};
