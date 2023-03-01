import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, Stack, Tooltip, Typography } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormCheckbox, FormSwitch } from '@src/components';
import { SettingsDownloadsExtensions } from '@src/components/panel/settings/settings-downloads-extensions';
import type { DownloadExtension, Downloads } from '@src/models';
import { ColorLevel, ColorLevelMap, defaultDownloads, InterfaceHeader } from '@src/models';
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
    setValue,
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

  const addExtension = (extension: DownloadExtension) => {
    const extensions = getValues().intercept?.extensions ?? [];
    if (extensions.map(e => JSON.stringify(e)).includes(JSON.stringify(extension))) return;
    setValue('intercept.extensions', [...extensions, extension], {
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
        id={InterfaceHeader.downloads}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
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
            <FormSwitch controllerProps={{ name: 'notifications', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
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
        <CardHeader
          title={i18n('intercept__enabled__title')}
          subheader={i18n('intercept__enabled__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
          action={
            <FormSwitch
              controllerProps={{ name: 'intercept.enabled', control }}
              formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
        <Collapse in={getValues()?.intercept?.enabled} unmountOnExit={true}>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem', maxWidth: '80%' }}>
            {i18n('intercept__warning')}
          </Typography>
          <CardHeader
            title={i18n('intercept__erase__title')}
            subheader={i18n('intercept__erase__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'intercept.erase', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled || !getValues()?.intercept?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('intercept__resume__title')}
            subheader={i18n('intercept__resume__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'intercept.resume', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('intercept__modal__title')}
            subheader={i18n('intercept__modal__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'intercept.modal', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <Collapse in={getValues().intercept?.modal} unmountOnExit={true}>
            <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
              {i18n('intercept__modal__warning')}
            </Typography>
          </Collapse>
          <CardHeader
            title={i18n('intercept__all__title')}
            subheader={i18n('intercept__all__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            action={
              <FormSwitch
                controllerProps={{ name: 'intercept.all', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled || !getValues()?.intercept?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('intercept__extensions__title')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={i18n('intercept__extensions__subheader')}
            subheaderTypographyProps={{ variant: 'subtitle2', sx: { maxWidth: '95%' } }}
            sx={{ p: '0.5rem 0' }}
          />
          <Card sx={{ p: '1.5rem 1rem 1rem', m: '0.5rem 0' }}>
            <Grid container spacing={1} columnSpacing={1}>
              {getValues().intercept?.extensions.map(extension => (
                <Grid item xs={3} lg={2} key={`${extension.ext}-${extension.mime}`}>
                  <Button
                    disableTouchRipple={true}
                    sx={{ p: '0 0 0 0.5rem' }}
                    color={getHighlightColor(extension)}
                    disabled={!getValues()?.enabled || !getValues()?.intercept?.enabled}
                  >
                    <FormCheckbox
                      controllerProps={{ name: 'intercept.active', control }}
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
                        disabled: !getValues()?.enabled || !getValues()?.intercept?.enabled || getValues()?.intercept?.all,
                      }}
                    />
                  </Button>
                </Grid>
              ))}
            </Grid>
            <SettingsDownloadsExtensions extensions={getValues().intercept?.extensions} addExtension={addExtension} />
          </Card>
        </Collapse>
      </CardContent>

      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="secondary" sx={{ flex: '0 1 8rem' }} startIcon={<SettingsBackupRestoreIcon />} onClick={onReset}>
            {i18n('restore', 'common', 'buttons')}
          </Button>
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
