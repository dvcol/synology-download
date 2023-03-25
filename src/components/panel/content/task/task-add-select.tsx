import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { finalize, lastValueFrom } from 'rxjs';

import { FormCheckbox, IconLoader } from '@src/components';
import type { FormRules, TaskListDownloadRequest, TaskListResponse } from '@src/models';
import { LoggerService, NotificationService, QueryService } from '@src/services';
import { useI18n, before } from '@src/utils';

import type { FC } from 'react';
import type { Subscription } from 'rxjs';

type TaskAddSelectProp = {
  open: boolean;
  list_id: string;
  source: string;
  destination?: string;
  onFormCancel?: (form: TaskListDownloadRequest) => void;
  onFormSubmit?: (form: TaskListDownloadRequest) => void;
};
export const TaskAddSelect: FC<TaskAddSelectProp> = ({ open, list_id, source, destination, onFormCancel, onFormSubmit }) => {
  const i18n = useI18n('panel', 'content', 'task', 'add', 'select');
  const [loading, setLoading] = useState<number>(0);

  const [response, setResponse] = useState<TaskListResponse>();

  const {
    handleSubmit,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted, isSubmitSuccessful },
  } = useForm<TaskListDownloadRequest>({
    mode: 'onChange',
    defaultValues: {
      list_id: list_id ?? '',
      selected: [],
      destination: destination ?? '',
      create_subfolder: true,
    },
  });

  const rules: FormRules<TaskListDownloadRequest> = {
    selected: {
      validate: (_selected?: any[]) => !!_selected?.length,
    },
  };

  useEffect(() => {
    let sub: Subscription;
    if (open) {
      sub = QueryService.getTaskList(list_id)
        .pipe(
          before(() => setLoading(_loading => _loading + 1)),
          finalize(() => setLoading(_loading => _loading - 1)),
        )
        .subscribe({
          next: _response => setResponse(_response),
          error: error => {
            LoggerService.error(`Failed to fetch files for list '${list_id}'`, { list_id, error });
            NotificationService.error({
              title: i18n(`task_list_fail`, 'common', 'error'),
              message: error?.message ?? error?.name ?? '',
            });
          },
        });
    }
    return () => {
      if (!sub?.closed) sub?.unsubscribe();
    };
  }, [open]);

  const onCancel = (data: TaskListDownloadRequest) => {
    return lastValueFrom(
      QueryService.deleteTaskList(list_id).pipe(
        before(() => setLoading(_loading => _loading + 1)),
        finalize(() => {
          setLoading(_loading => _loading - 1);
          onFormCancel?.(data);
        }),
      ),
    ).catch(error => {
      LoggerService.error(`Failed to delete list '${list_id}'`, { list_id, error });
      NotificationService.error({
        title: i18n(`task_list_delete_fail`, 'common', 'error'),
        message: error?.message ?? error?.name ?? '',
      });
    });
  };

  const onSubmit = (data: TaskListDownloadRequest) => {
    if (!isDirty) return;
    return lastValueFrom(
      QueryService.setTaskListDownload(data, { name: response?.title ?? 'unkown', source }).pipe(
        before(() => setLoading(_loading => _loading + 1)),
        finalize(() => {
          setLoading(_loading => _loading - 1);
          onFormSubmit?.(data);
        }),
      ),
    ).catch(error => {
      LoggerService.error(`Failed to set download list '${list_id}'`, { list_id, error });
      NotificationService.error({
        title: i18n(`task_list_set_download_fail`, 'common', 'error'),
        message: error?.message ?? error?.name ?? '',
      });
    });
  };

  const onSubmitColor = () => {
    if (!isSubmitted || isDirty) return 'info';
    return isSubmitSuccessful ? 'success' : 'error';
  };

  return (
    <Dialog
      open={open}
      onClose={() => handleSubmit(onCancel)}
      aria-labelledby="confirm-delete-dialog"
      maxWidth={'md'}
      PaperProps={{ sx: { maxHeight: 'calc(100% - 1em)' } }}
    >
      <DialogTitle>
        {i18n('select_files')}
        {response?.title && (
          <Typography variant="subtitle1" sx={{ mt: '0.5rem' }}>
            {i18n('title')}: {response.title}
          </Typography>
        )}
        {isDirty && !isValid && <FormHelperText error={true}>{i18n('required')}</FormHelperText>}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <LinearProgress
          variant={'indeterminate'}
          sx={{
            height: '0.125rem',
            transition: 'opacity 0.3s linear',
            opacity: loading > 0 ? 1 : 0,
          }}
        />
        <Card sx={{ maxHeight: '30em', maxWidth: '35em', minHeight: '22em', minWidth: '30em', overflow: 'auto' }}>
          <List>
            {response?.files?.map(file => {
              return (
                <ListItem
                  key={file.index}
                  secondaryAction={
                    <FormCheckbox
                      controllerProps={{ name: 'selected', control, rules: rules.selected }}
                      checkboxProps={{
                        multiple: true,
                        value: file.index,
                        disabled: loading > 0,
                      }}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText id={file.index?.toString()} primary={file.name} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
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
            disabled={loading > 0 || !isValid || !QueryService.isLoggedIn}
            onClick={handleSubmit(onSubmit)}
            startIcon={<IconLoader icon={<SaveIcon />} loading={isDirty && loading > 0} props={{ size: '1.25rem', color: onSubmitColor() }} />}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};
