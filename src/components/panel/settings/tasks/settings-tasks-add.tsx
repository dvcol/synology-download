import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { ButtonWithConfirm, FormSwitch } from '@src/components';
import type { TaskSettings } from '@src/models';
import { defaultDownloads, defaultTaskSettings, TasksHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { syncDownloads, syncTasksSettings } from '@src/store/actions';
import { getTaskSettings } from '@src/store/selectors';
import { useI18n } from '@src/utils';

export const SettingsTasksAdd = () => {
  const i18n = useI18n('panel', 'settings', 'task_form');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, TaskSettings>(getTaskSettings);

  const {
    handleSubmit,
    reset,
    control,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<TaskSettings>({
    mode: 'onChange',
    defaultValues: {
      ...defaultTaskSettings,
      ...state,
    },
  });

  const onSubmit = (data: TaskSettings) => {
    dispatch(syncTasksSettings(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const onReset = () => {
    dispatch(syncDownloads(defaultDownloads));
    reset(defaultTaskSettings);
  };
  return (
    <Card raised={true}>
      <CardHeader
        id={TasksHeader.form}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('clear_on_exist__title')}
          subheader={i18n('clear_on_exist__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
          action={<FormSwitch controllerProps={{ name: 'clearOnExist', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={onReset}
          />
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={!isValid}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
