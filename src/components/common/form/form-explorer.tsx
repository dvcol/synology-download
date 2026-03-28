import type { ExplorerEvent, ExplorerProps } from '@src/components';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';

import { Explorer } from '@src/components';
import React from 'react';
import { Controller } from 'react-hook-form';

interface FormExplorerProps<T extends FieldValues, N extends FieldPath<T>> {
  controllerProps: Omit<ControllerProps<T, N>, 'render'>;
  explorerProps?: Omit<ExplorerProps, 'onChange'>;
  onChange?: (event: ExplorerEvent) => void;
}

export function FormExplorer<T extends FieldValues, N extends FieldPath<T>>({
  controllerProps,
  explorerProps,
  onChange,
}: FormExplorerProps<T, N>) {
  const render: ControllerProps['render'] = ({ field: { onChange: _onChange } }) => {
    return (
      <Explorer
        onChange={({ id, path, folder }) => {
          onChange?.({ id, path, folder });
          _onChange(path);
        }}
        {...explorerProps}
      />
    );
  };
  const _controllerProps = { ...controllerProps, render } as ControllerProps;
  return <Controller {..._controllerProps} />;
}
