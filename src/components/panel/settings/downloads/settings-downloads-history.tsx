import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Stack, Typography } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { ButtonWithConfirm, FormInput, FormSwitch } from '@src/components';
import type { StateSlice } from '@src/models';
import { ColorLevel, ColorLevelMap, DownloadsHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { syncDownloadState } from '@src/store/actions';
import { getDownloadState } from '@src/store/selectors';
import { initialState } from '@src/store/slices/state.slice';
import { useI18n } from '@src/utils';

type StateDownload = StateSlice['download'];

export const SettingsDownloadsHistory = () => {
  const i18n = useI18n('panel', 'settings', 'downloads', 'history');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, StateDownload>(getDownloadState);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<StateDownload>({
    mode: 'onChange',
    defaultValues: {
      ...initialState.download,
      ...state,
      defaultFolder: state.defaultFolder ?? initialState.download.defaultFolder ?? '',
    },
  });

  const rules = {
    required: {
      value: true,
      message: i18n('required', 'common', 'error'),
    },
    min: {
      value: 1,
      message: i18n('required', 'common', 'error'),
    },
  };

  const onSubmit = (data: StateDownload) => {
    dispatch(syncDownloadState(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const onReset = () => {
    dispatch(syncDownloadState(initialState.download));
    reset(initialState.download);
  };
  return (
    <Card raised={true}>
      <CardHeader
        id={DownloadsHeader.history}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('warning')}
          </Typography>
          <CardHeader
            title={i18n('default_folder__title')}
            subheader={i18n('default_folder__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            sx={{ p: '0.5rem 0' }}
          />
          <FormInput
            controllerProps={{ name: 'defaultFolder', control, rules }}
            textFieldProps={{
              type: 'text',
              label: i18n('default_folder__label'),
              sx: { flex: '1 1 auto', width: '100%', mt: '0.5rem' },
            }}
          />
        </Collapse>
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
