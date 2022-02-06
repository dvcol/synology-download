import { Button, Card, CardActions, CardContent, CardHeader, MenuItem, Stack } from '@mui/material';
import React from 'react';
import { NotificationHeader, NotificationLevel, NotificationLevelKeys, Notifications, NotificationsBanner } from '../../../models';
import { FormInput, FormSwitch } from '../../common';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '../../../store';
import { useForm } from 'react-hook-form';
import { useI18n } from '../../../utils';

export const SettingsBanner = () => {
  const i18n = useI18n('panel', 'settings', 'banner');
  const dispatch = useDispatch();
  const notifications: Notifications = useSelector(getNotifications);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<NotificationsBanner>({ mode: 'onChange', defaultValues: notifications?.banner });

  const onSubmit = (banner: NotificationsBanner) => {
    dispatch(syncNotifications({ ...notifications, banner }));
    reset(banner);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };
  return (
    <Card raised={true}>
      <CardHeader
        id={NotificationHeader.banner}
        title={i18n('toggle_title')}
        subheader={i18n('toggle_subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('level_title')}
          subheader={i18n('level_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'level', control }}
              textFieldProps={{
                select: true,
                label: i18n('level_label'),
                sx: { flex: '0 0 14rem', textTransform: 'capitalize', ml: '2rem' },
                disabled: !getValues()?.enabled,
              }}
            >
              {[NotificationLevel.debug, NotificationLevel.info, NotificationLevel.warn, NotificationLevel.error].map((level) => (
                <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                  {NotificationLevelKeys[level]}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />

        <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
          <CardHeader
            title={i18n('background_title')}
            subheader={i18n('background_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'scope.background', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('popup_title')}
            subheader={i18n('popup_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch controllerProps={{ name: 'scope.popup', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('completed_title')}
            subheader={i18n('completed_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'scope.finished', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('failed_title')}
            subheader={i18n('failed_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'scope.failed', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
        </Card>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
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
