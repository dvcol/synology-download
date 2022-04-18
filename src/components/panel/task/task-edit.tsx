import { Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';

import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';

import { lastValueFrom } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormExplorer } from '@src/components';
import type { Task } from '@src/models';
import { QueryService } from '@src/services';

type TaskEditForm = { id: string; destination: string };

export const TaskEdit = ({
  open,
  task,
  onFormCancel,
  onFormSubmit,
}: {
  open: boolean;
  task: Task;
  onFormCancel?: (form: TaskEditForm) => void;
  onFormSubmit?: (form: TaskEditForm) => void;
}) => {
  const i18n = useI18n('panel', 'task', 'edit');
  const [state, setState] = React.useState(open);
  useEffect(() => setState(open), [open]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid, isDirty, isSubmitted, isSubmitSuccessful },
  } = useForm<TaskEditForm>({
    mode: 'onChange',
    defaultValues: {
      id: task?.id ?? '',
      destination: task?.additional?.detail?.destination ?? '',
    },
  });

  const onCancel = (data: TaskEditForm) => {
    onFormCancel?.(data);
    setState(false);
  };

  const onSubmit = (data: TaskEditForm) => {
    return lastValueFrom(QueryService.editTask(task?.id, data?.destination)).then(() => {
      reset(data);
      onFormSubmit?.(data);
      setState(false);
    });
  };

  const onSubmitColor = () => {
    if (!isSubmitted || isDirty) return 'info';
    return isSubmitSuccessful ? 'success' : 'error';
  };

  return (
    <Dialog open={state} onClose={() => handleSubmit(onCancel)} aria-labelledby="confirm-delete-dialog" maxWidth={'md'}>
      <DialogTitle>{i18n('destination_folder')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'row' }}>
        <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '50vh', width: '60vw' }}>
          <FormExplorer
            controllerProps={{ name: 'destination', control }}
            explorerProps={{ flatten: true, startPath: task?.additional?.detail?.destination }}
          />
        </Card>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color={'secondary'} sx={{ width: '5rem' }} onClick={handleSubmit(onCancel)}>
            {i18n('cancel', 'common', 'buttons')}
          </Button>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={!isValid || !QueryService.isLoggedIn}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
