import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, InputAdornment, MenuItem, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormCheckbox, FormInput, FormSwitch } from '@src/components';
import type { Global } from '@src/models';
import { ActionScope, defaultGlobal, InterfaceHeader, InterfaceSize, NavbarButtonType, ThemeMode } from '@src/models';
import type { StoreState } from '@src/store';
import { syncInterface } from '@src/store/actions';
import { getGlobal } from '@src/store/selectors';

export const SettingsGlobal = () => {
  const i18n = useI18n('panel', 'settings', 'global');
  const dispatch = useDispatch();
  const state = useSelector<StoreState, Global>(getGlobal);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<Global>({
    mode: 'onChange',
    defaultValues: {
      ...state,
      theme: state.theme ?? defaultGlobal.theme,
      actions: state.actions ?? defaultGlobal.actions,
      loading: state.loading ?? defaultGlobal.loading,
      task: state.task ?? {
        progressBar: true,
        background: true,
      },
      download: state.download ?? {
        progressBar: true,
        background: true,
      },
      navbar: state.navbar ?? defaultGlobal.navbar,
      interface: state.interface ?? defaultGlobal.interface,
    },
  });

  const onSubmit = (data: Global) => {
    dispatch(syncInterface(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={InterfaceHeader.global}
        title={i18n('title')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheader={i18n('subheader')}
        subheaderTypographyProps={{ color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('theme_title')}
          subheader={i18n('theme_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'theme', control }}
              textFieldProps={{
                select: true,
                label: i18n('theme_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
              }}
            >
              {Object.values(ThemeMode).map(theme => (
                <MenuItem key={theme} value={theme} sx={{ textTransform: 'capitalize' }}>
                  {i18n(theme, 'common', 'model', 'theme_mode')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('interface_size_title')}
          subheader={i18n('interface_size_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'interface.size', control }}
              textFieldProps={{
                select: true,
                label: i18n('interface_size_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
              }}
            >
              {Object.entries(InterfaceSize)
                .filter(([key]) => Number.isNaN(+key))
                .map(([key, size]) => (
                  <MenuItem key={key} value={size} sx={{ textTransform: 'capitalize' }}>
                    {i18n(key, 'common', 'model', 'interface_size')}
                  </MenuItem>
                ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('actions_title')}
          subheader={i18n('actions_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'actions', control }}
              textFieldProps={{
                select: true,
                label: i18n('actions_label'),
                sx: { flex: '0 0 10rem', textTransform: 'capitalize' },
              }}
            >
              {Object.values(ActionScope).map(scope => (
                <MenuItem key={scope} value={scope} sx={{ textTransform: 'capitalize' }}>
                  {i18n(scope, 'common', 'model', 'action_scope')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('loading_title')}
          subheader={i18n('loading_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'loading.enabled', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <Collapse in={getValues()?.loading?.enabled} unmountOnExit={true}>
          <CardHeader
            title={i18n('loading_threshold_title')}
            subheader={i18n('loading_threshold_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{
                  name: 'loading.threshold',
                  control,
                  rules: {
                    min: { value: 0, message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error') },
                    max: { value: 60000, message: i18n({ key: 'max', substitutions: ['60000'] }, 'common', 'error') },
                  },
                }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('loading_threshold_label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                  },
                  disabled: !getValues()?.loading?.enabled,
                  sx: { flex: '0 0 10rem', ml: '0.5rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0', mt: '0.5rem' }}
          />
        </Collapse>
        <CardHeader
          title={i18n('task__progress_bar_title')}
          subheader={i18n('task__progress_bar_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'task.progressBar', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('task__background_title')}
          subheader={i18n('task__background_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'task.background', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('download__progress_bar_title')}
          subheader={i18n('download__progress_bar_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'download.progressBar', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('download__background_title')}
          subheader={i18n('download__background_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'download.background', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('navbar__buttons_title')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheader={i18n('navbar__buttons_subheader')}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          sx={{ p: '0.5rem 0' }}
        />
        <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
          <Grid container spacing={1} columnSpacing={1}>
            {Object.values(NavbarButtonType).map(t => (
              <Grid item xs={4} lg={2} key={t}>
                <Button disableTouchRipple={true} sx={{ p: '0 0 0 0.5rem' }}>
                  <FormCheckbox
                    controllerProps={{ name: 'navbar.buttons', control }}
                    formControlLabelProps={{ label: i18n(t, 'common', 'model', 'navbar_button_type'), sx: { textTransform: 'capitalize' } }}
                    checkboxProps={{
                      multiple: true,
                      value: t,
                    }}
                  />
                </Button>
              </Grid>
            ))}
          </Grid>
        </Card>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultGlobal)}
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
