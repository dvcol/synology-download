import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, InputAdornment, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormInput, FormSwitch } from '@src/components';
import type { FormRules, Polling } from '@src/models';
import { ConnectionHeader, defaultPolling } from '@src/models';
import { syncPolling } from '@src/store/actions';
import { getPolling } from '@src/store/selectors';

export const SettingsPolling = () => {
  const i18n = useI18n('panel', 'settings', 'polling');
  const dispatch = useDispatch();
  const polling: Polling = useSelector(getPolling);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<Polling>({
    mode: 'onChange',
    defaultValues: {
      ...defaultPolling,
      ...polling,
    },
  });

  const rules: FormRules<{ interval: number }> = {
    interval: {
      min: { value: 500, message: i18n({ key: 'min', substitutions: ['500'] }, 'common', 'error') },
      max: { value: 86400, message: i18n({ key: 'max', substitutions: ['86400'] }, 'common', 'error') },
    },
  };

  const onSubmit = (data: Polling) => {
    dispatch(syncPolling(data));
    reset(data, { keepIsSubmitted: true, keepSubmitCount: true });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={ConnectionHeader.polling}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
            <CardHeader
              title={i18n('popup_title')}
              subheader={i18n('popup_subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormSwitch
                  controllerProps={{ name: 'popup.enabled', control }}
                  formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
                />
              }
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('background_title')}
              subheader={
                <Box>
                  <Box>{i18n('background_subheader_line_1')}</Box>
                  <Box>{i18n('background_subheader_line_2')}</Box>
                </Box>
              }
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormSwitch
                  controllerProps={{ name: 'background.enabled', control }}
                  formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
                />
              }
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('interval_title')}
              subheader={i18n('interval_subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              sx={{ p: '1rem 0' }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <FormInput
                controllerProps={{ name: 'popup.interval', control, rules: rules.interval }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('interval_popup_label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  },
                  disabled: !getValues()?.enabled || !getValues()?.popup?.enabled,
                  sx: { flex: '1 1 30ch' },
                }}
              />
              <FormInput
                controllerProps={{ name: 'background.interval', control, rules: rules.interval }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('interval_background_label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  },
                  disabled: !getValues()?.enabled || !getValues()?.background?.enabled,
                  sx: { flex: '1 1 30ch' },
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultPolling)}
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
