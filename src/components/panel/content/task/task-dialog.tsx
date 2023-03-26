import { Dialog, DialogContent } from '@mui/material';

import React, { useEffect } from 'react';

import type { TaskAddProps } from '@src/components';
import { TaskAdd } from '@src/components';
import type { TaskForm } from '@src/models';

import type { PortalProps } from '@mui/base/Portal';
import type { DialogProps } from '@mui/material';
import type { FC } from 'react';

export const TaskDialog: FC<{
  container?: PortalProps['container'];
  dialogProps?: Partial<DialogProps>;
  taskAddProps?: Partial<TaskAddProps>;
  open: boolean;
  taskForm?: TaskForm;
  onClose?: (form?: TaskForm) => void;
  onCancel?: (form?: TaskForm) => void;
  onSubmit?: (form?: TaskForm) => void;
}> = ({ container, dialogProps, taskAddProps, taskForm, open, onClose, onCancel, onSubmit }) => {
  const [form, setForm] = React.useState<TaskForm>(taskForm ?? {});

  useEffect(() => {
    setForm(taskForm ?? {});
  }, [taskForm]);

  const clearForm = () => setForm({});
  return (
    <Dialog
      open={open}
      container={container}
      fullWidth={true}
      maxWidth={'md'}
      {...dialogProps}
      onClose={() => {
        onClose?.(form);
        clearForm();
      }}
    >
      <DialogContent sx={{ p: '0' }}>
        <TaskAdd
          form={form}
          withCancel={true}
          {...taskAddProps}
          onFormCancel={() => {
            onCancel?.();
            clearForm();
          }}
          onFormSubmit={() => {
            onSubmit?.();
            clearForm();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
