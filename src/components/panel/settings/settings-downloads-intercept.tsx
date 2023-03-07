import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, Stack, Tooltip, Typography } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { ButtonWithConfirm, FormCheckbox, FormSwitch } from '@src/components';
import { SettingsDownloadsExtensions } from '@src/components/panel/settings/settings-downloads-extensions';
import type { DownloadExtension, DownloadsIntercept } from '@src/models';
import { ColorLevel, ColorLevelMap, defaultDownloads, DownloadsHeader } from '@src/models';
import type { StoreState } from '@src/store';
import { syncDownloadsIntercept } from '@src/store/actions';
import { getSettingsDownloadsEnabled, getSettingsDownloadsIntercept } from '@src/store/selectors';

export const SettingsDownloadsIntercept = () => {
  const i18n = useI18n('panel', 'settings', 'downloads', 'intercept');
  const dispatch = useDispatch();
  const downloadEnabled = useSelector<StoreState, boolean>(getSettingsDownloadsEnabled);
  const state = useSelector<StoreState, DownloadsIntercept>(getSettingsDownloadsIntercept);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<DownloadsIntercept>({
    mode: 'onChange',
    defaultValues: {
      ...defaultDownloads.intercept,
      ...state,
    },
  });

  const onSubmit = (data: DownloadsIntercept) => {
    dispatch(syncDownloadsIntercept(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const onReset = () => {
    dispatch(syncDownloadsIntercept(defaultDownloads.intercept));
    reset(defaultDownloads.intercept);
  };

  const addExtension = (extension: DownloadExtension) => {
    const extensions = getValues()?.extensions ?? [];
    if (extensions.map(e => JSON.stringify(e)).includes(JSON.stringify(extension))) return;
    setValue('extensions', [...extensions, extension], {
      shouldValidate: true,
      shouldDirty: true,
    });
    reset(getValues(), {
      keepErrors: true,
      keepDirty: true,
      keepTouched: true,
    });
  };

  const getHighlightColor = (extension: DownloadExtension) => (extension?.mime ? ColorLevel.primary : ColorLevel.warning);

  return (
    <Card raised={true}>
      <CardHeader
        id={DownloadsHeader.intercept}
        title={i18n('enabled__title')}
        subheader={i18n('enabled__subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '', disabled: !downloadEnabled }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled && downloadEnabled} unmountOnExit>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem', maxWidth: '80%' }}>
            {i18n('warning')}
          </Typography>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem', maxWidth: '80%' }}>
            {i18n('alpha__warning')}
          </Typography>
          <CardHeader
            title={i18n('erase__title')}
            subheader={i18n('erase__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'erase', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled || !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('resume__title')}
            subheader={i18n('resume__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch controllerProps={{ name: 'resume', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('modal__title')}
            subheader={i18n('modal__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch controllerProps={{ name: 'modal', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <Collapse in={getValues().modal} unmountOnExit={true}>
            <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
              {i18n('modal__warning')}
            </Typography>
          </Collapse>
          <CardHeader
            title={i18n('all__title')}
            subheader={i18n('all__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'all', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled || !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />

          <Collapse in={!getValues()?.all} unmountOnExit>
            <CardHeader
              title={i18n('extensions__title')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheader={i18n('extensions__subheader')}
              subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
              sx={{ p: '0.5rem 0' }}
            />
            <Card sx={{ p: '1.5rem 1rem 1rem', m: '0.5rem 0' }}>
              <Grid container spacing={1} columnSpacing={1}>
                {getValues().extensions.map(extension => (
                  <Grid item xs={3} lg={2} key={`${extension.ext}-${extension.mime}`}>
                    <Button
                      disableTouchRipple={true}
                      sx={{ p: '0 0 0 0.5rem' }}
                      color={getHighlightColor(extension)}
                      disabled={!getValues()?.enabled || !getValues()?.enabled}
                    >
                      <FormCheckbox
                        controllerProps={{ name: 'active', control }}
                        formControlLabelProps={{
                          label: (
                            <Tooltip title={extension.mime ?? '⚠ no mime type specified'}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textTransform: 'lowercase', color: getHighlightColor(extension) }}
                              >
                                {extension.ext}
                              </Typography>
                            </Tooltip>
                          ),
                          sx: { textTransform: 'capitalize', textAlign: 'start' },
                        }}
                        checkboxProps={{
                          multiple: true,
                          value: extension,
                          color: getHighlightColor(extension),
                          disabled: !getValues()?.enabled || !getValues()?.enabled || getValues()?.all,
                        }}
                      />
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <SettingsDownloadsExtensions extensions={getValues().extensions} addExtension={addExtension} />
            </Card>
          </Collapse>
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
