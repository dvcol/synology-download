import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormSwitch } from '@src/components';
import type { Downloads } from '@src/models';
import { defaultDownloads, DownloadsHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { syncDownloads } from '@src/store/actions';
import { getSettingsDownloads } from '@src/store/selectors';

export const SettingsDownloads = () => {
  const i18n = useI18n('panel', 'settings', 'downloads');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, Downloads>(getSettingsDownloads);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<Downloads>({
    mode: 'onChange',
    defaultValues: {
      ...defaultDownloads,
      ...state,
      transfer: { ...defaultDownloads.transfer, ...state.transfer },
      intercept: { ...defaultDownloads.intercept, ...state.intercept },
    },
  });

  const onSubmit = (data: Downloads) => {
    dispatch(syncDownloads(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const onReset = () => {
    dispatch(syncDownloads(defaultDownloads));
    reset(defaultDownloads);
  };
  return (
    <Card raised={true}>
      <CardHeader
        id={DownloadsHeader.general}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <CardHeader
            title={i18n('buttons__title')}
            subheader={i18n('buttons__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch controllerProps={{ name: 'buttons', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('notifications__title')}
            subheader={i18n('notifications__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'notifications', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('transfer__erase__title')}
            subheader={i18n('transfer__erase__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'transfer.erase', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('transfer__resume__title')}
            subheader={i18n('transfer__resume__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'transfer.resume', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('transfer__modal__title')}
            subheader={i18n('transfer__modal__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'transfer.modal', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
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
