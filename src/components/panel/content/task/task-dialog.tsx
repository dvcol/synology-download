import type { DialogProps } from '@mui/material';
import type { PortalProps } from '@mui/material/Portal';
import type { FC } from 'react';

import type { TaskForm } from '../../../../models/task.model';
import type { TaskAddProps } from './task-add';

import { Dialog, DialogContent } from '@mui/material';
import { useEffect, useState } from 'react';

import { TaskAdd } from './task-add';

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
  const [form, setForm] = useState<TaskForm>(taskForm ?? {});

  useEffect(() => {
    // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect -- TODO investigate if this can be avoided
    setForm(taskForm ?? {});
  }, [taskForm]);

  const clearForm = () => setForm({});
  return (
    <Dialog
      open={open}
      container={container}
      fullWidth={true}
      maxWidth="md"
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
