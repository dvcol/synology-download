import DownloadIcon from '@mui/icons-material/Download';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, MenuItem, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormInput, FormSwitch } from '@src/components';
import type { AdvancedLogging, RootSlice } from '@src/models';
import { AdvancedHeader, ColorLevel, defaultAdvancedLogging, defaultAdvancedSettings, LoggingLevel, LoggingLevelLevelKeys } from '@src/models';
import { LoggerService } from '@src/services';
import { syncAdvancedLogging } from '@src/store/actions';
import { getAdvancedSettingsLogging } from '@src/store/selectors';

export const SettingsLogging = () => {
  const i18n = useI18n('panel', 'settings', 'advanced', 'logging');
  const dispatch = useDispatch();
  const advancedSettings = useSelector<RootSlice, AdvancedLogging>(getAdvancedSettingsLogging);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<AdvancedLogging>({
    mode: 'onChange',
    defaultValues: {
      ...defaultAdvancedSettings,
      ...advancedSettings,
    },
  });

  const onSubmit = (data: AdvancedLogging) => {
    dispatch(syncAdvancedLogging(data));
    reset(data, { keepIsSubmitted: true, keepSubmitCount: true });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
  };

  const exportHistory = () => {
    LoggerService.info('TODO : export history');
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={AdvancedHeader.logging}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <CardHeader
            title={i18n('level__title')}
            subheader={i18n('level__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'level', control }}
                textFieldProps={{
                  select: true,
                  label: i18n('level__label'),
                  sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
                  disabled: !getValues()?.enabled,
                }}
              >
                {[LoggingLevel.trace, LoggingLevel.debug, LoggingLevel.info, LoggingLevel.warn, LoggingLevel.error].map(level => (
                  <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                    {i18n(LoggingLevelLevelKeys[level], 'common', 'model', 'logging', 'level')}
                  </MenuItem>
                ))}
              </FormInput>
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('history__title')}
            subheader={i18n('history__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch controllerProps={{ name: 'history', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
        </Collapse>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color={ColorLevel.primary}
            startIcon={<DownloadIcon />}
            type="submit"
            disabled={!getValues().history}
            onClick={exportHistory}
          >
            {i18n('history__export')}
          </Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultAdvancedLogging)}
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
