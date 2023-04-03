import SaveIcon from '@mui/icons-material/Save';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { useSelector } from 'react-redux';

import { finalize, lastValueFrom } from 'rxjs';

import { FormExplorer, FormInput, IconLoader } from '@src/components';
import type { FormRules, RootSlice, Task, TaskBtEditRequest, TaskFile } from '@src/models';
import { TaskPriority, TaskStatus, TaskType } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';

import { getTaskFilesById } from '@src/store/selectors';
import { before, useDebounceObservable, useI18n } from '@src/utils';

import { TaskEditFiles } from './task-edit-files';

import type { SyntheticEvent } from 'react';
import type { Subscription } from 'rxjs';

type TaskEditForm = TaskBtEditRequest;

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
  const i18n = useI18n('panel', 'content', 'task', 'edit');

  const taskFiles = useSelector<RootSlice, TaskFile[]>(getTaskFilesById(task.id));

  const [tab, setTab] = useState(0);
  const [isActive, setIsActive] = useState<boolean>(task?.status === TaskStatus.downloading && !!task?.received);

  const [loading, setLoading] = useState<boolean>();
  const [loadingBar, setLoadingBar] = useState<boolean>(false);

  // Loading observable for debounce
  const [, next] = useDebounceObservable<boolean>(setLoadingBar);

  const getNewForm = (_task = task) => ({
    task_id: _task?.id ?? '',
    destination: _task?.additional?.detail?.destination ?? '',
    priority: _task?.additional?.detail?.priority ?? TaskPriority.normal,
    max_peers: 0,
    max_download_rate: 0,
    max_upload_rate: 0,
    seeding_interval: 0,
    seeding_ratio: 0,
  });

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { isValid, isDirty, isSubmitted, isSubmitSuccessful },
  } = useForm<TaskEditForm>({
    mode: 'onChange',
    defaultValues: getNewForm(),
  });

  const rules: FormRules<TaskEditForm> = {
    max_peers: {
      min: { value: 0, message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error') },
    },
    max_download_rate: {
      min: { value: 0, message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error') },
    },
    max_upload_rate: {
      min: { value: 0, message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error') },
    },
    seeding_interval: {
      min: { value: -1, message: i18n({ key: 'min', substitutions: ['-1'] }, 'common', 'error') },
    },
    seeding_ratio: {
      min: { value: 0, message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error') },
    },
  };

  useEffect(() => {
    reset(getNewForm());
    let sub: Subscription;
    if (open) {
      sub = QueryService.getTaskEdit(task.id)
        .pipe(
          before(() => {
            setLoading(true);
            next(true);
          }),
          finalize(() => {
            setLoading(false);
            setLoadingBar(false);
            next(false); // So that observable data is not stale
          }),
        )
        .subscribe({
          next: response => {
            const { extract_password, is_active_torrent, ..._response } = response;
            setIsActive(is_active_torrent);
            reset({
              ...getValues(),
              ..._response,
            });
          },
          error: error => {
            LoggerService.error(`Failed to fetch edit data for task '${task.id}'`, { task, error });
            NotificationService.error({
              title: i18n(`task_edit_get_fail`, 'common', 'error'),
              message: error?.message ?? error?.name ?? '',
            });
          },
        });
    }
    return () => {
      if (!sub?.closed) sub?.unsubscribe();
    };
  }, [open]);

  const onCancel = (data: TaskEditForm) => {
    onFormCancel?.(data);
  };

  const onSubmit = (data: TaskEditForm) => {
    if (!isDirty) {
      reset(data);
      onFormSubmit?.(data);
      return;
    }
    return lastValueFrom(
      QueryService.editTask(task.type, data).pipe(
        before(() => {
          setLoading(true);
          next(true);
        }),
        finalize(() => {
          setLoading(false);
          setLoadingBar(false);
          next(false); // So that observable data is not stale
        }),
      ),
    )
      .then(() => {
        reset(data);
        onFormSubmit?.(data);
      })
      .catch(error => {
        LoggerService.error(`Failed to edit data for task '${task.id}'`, { data, task, error });
        NotificationService.error({
          title: i18n(`task_edit_set_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
      });
  };

  const onSubmitColor = () => {
    if (!isSubmitted || isDirty) return 'info';
    return isSubmitSuccessful ? 'success' : 'error';
  };

  const changeTab = (_: SyntheticEvent, newValue: number) => setTab(newValue);
  const isBt = task.type === TaskType.bt;
  const disableTask = !isBt || !isActive;
  const disableTaskFiles = disableTask || !taskFiles?.length;

  return (
    <Dialog
      open={open}
      onClose={() => handleSubmit(onCancel)}
      aria-labelledby="confirm-delete-dialog"
      maxWidth={'md'}
      PaperProps={{ sx: { maxHeight: 'calc(100% - 1em)' } }}
    >
      <DialogTitle>{i18n('destination_folder')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <LinearProgress
          variant={'indeterminate'}
          sx={{
            height: '0.125rem',
            transition: 'opacity 0.3s linear',
            opacity: loadingBar ? 1 : 0,
          }}
        />
        <AppBar position="relative">
          <Tabs value={tab} onChange={changeTab} variant="fullWidth" aria-label="dialog-tabs">
            <Tab label={i18n('destination__tab_label')} />
            <Tab label={i18n('task__tab_label')} disabled={disableTask} />
            <Tab label={i18n('task_files__tab_label')} disabled={disableTaskFiles} />
          </Tabs>
        </AppBar>
        <Card sx={{ height: '30em', width: '35em', overflow: 'auto' }}>
          <Box hidden={tab !== 0} sx={{ p: '0.5rem' }}>
            <FormExplorer
              controllerProps={{ name: 'destination', control }}
              explorerProps={{ flatten: true, startPath: task?.additional?.detail?.destination }}
            />
          </Box>
          <Box hidden={tab !== 1} sx={{ p: '0.75em 1em' }}>
            <CardHeader
              title={i18n('priority__title')}
              subheader={i18n('priority__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{ name: 'priority', control }}
                  textFieldProps={{
                    select: true,
                    label: i18n('priority__label'),
                    sx: { flex: '0 0 14rem', textTransform: 'capitalize', ml: '2rem' },
                    disabled: loading,
                  }}
                >
                  {Object.values(TaskPriority).map(priority => (
                    <MenuItem key={priority} value={priority} sx={{ textTransform: 'capitalize' }}>
                      {i18n(priority, 'common', 'model', 'task_priority')}
                    </MenuItem>
                  ))}
                </FormInput>
              }
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('max_peers__title')}
              subheader={i18n('max_peers__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{
                    name: 'max_peers',
                    control,
                    rules: rules.max_peers,
                  }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('max_peers__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">peers</InputAdornment>,
                    },
                    disabled: loading,
                    sx: { flex: '0 0 14rem', ml: '0.5rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0', mt: '0.5rem' }}
            />
            <CardHeader
              title={i18n('max_download_rate__title')}
              subheader={i18n('max_download_rate__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{
                    name: 'max_download_rate',
                    control,
                    rules: rules.max_download_rate,
                  }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('max_download_rate__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                    },
                    disabled: loading,
                    sx: { flex: '0 0 14rem', ml: '0.5rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0', mt: '0.5rem' }}
            />
            <CardHeader
              title={i18n('max_upload_rate__title')}
              subheader={i18n('max_upload_rate__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{
                    name: 'max_upload_rate',
                    control,
                    rules: rules.max_upload_rate,
                  }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('max_upload_rate__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                    },
                    disabled: loading,
                    sx: { flex: '0 0 14rem', ml: '0.5rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0', mt: '0.5rem' }}
            />
            <CardHeader subheader={i18n('seeding_info')} subheaderTypographyProps={{ variant: 'subtitle2' }} sx={{ p: '0.5rem 0', mt: '0.5rem' }} />
            <CardHeader
              title={i18n('seeding_interval__title')}
              subheader={i18n('seeding_interval__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{
                    name: 'seeding_interval',
                    control,
                    rules: rules.seeding_interval,
                  }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('seeding_interval__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">minutes</InputAdornment>,
                    },
                    disabled: loading,
                    sx: { flex: '0 0 14rem', ml: '0.5rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0', mt: '0.5rem' }}
            />
            <CardHeader
              title={i18n('seeding_ratio__title')}
              subheader={i18n('seeding_ratio__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{
                    name: 'seeding_ratio',
                    control,
                    rules: rules.seeding_ratio,
                  }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('seeding_ratio__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    },
                    disabled: loading,
                    sx: { flex: '0 0 14rem', ml: '0.5rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0', mt: '0.5rem' }}
            />
          </Box>
          <Box hidden={tab !== 2}>
            <TaskEditFiles taskId={task.id} />
          </Box>
        </Card>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'flex-end', padding: '0 1rem 1rem' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color={'secondary'} sx={{ width: '5rem' }} onClick={() => onCancel(getValues())}>
            {i18n('cancel', 'common', 'buttons')}
          </Button>
          <Button
            variant="outlined"
            color={onSubmitColor()}
            type="submit"
            disabled={loading || !isValid || !QueryService.isLoggedIn}
            onClick={handleSubmit(onSubmit)}
            startIcon={<IconLoader icon={<SaveIcon />} loading={isDirty && loading} props={{ size: '1.25rem', color: onSubmitColor() }} />}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
