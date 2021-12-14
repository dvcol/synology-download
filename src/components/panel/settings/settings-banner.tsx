import { Button, Card, CardActions, CardContent, CardHeader, MenuItem, Stack } from '@mui/material';
import React from 'react';
import { NotificationHeader, NotificationLevel, NotificationLevelKeys, Notifications, NotificationsBanner } from '../../../models';
import { FormInput, FormSwitch } from '../../form';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '../../../store';
import { useForm } from 'react-hook-form';

export const SettingsBanner = () => {
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
    console.log('count submit', banner);
    console.log('options', Object.keys(NotificationLevel));
    dispatch(syncNotifications({ ...notifications, banner }));
    reset(banner);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const title = NotificationHeader.banner;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        subheader="Note that notification banners use and are subject to specific OS APIs."
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <CardHeader
          title={'Notification level'}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheader="Levels are cumulative and show all notifications from a lower level."
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'level', control }}
              textFieldProps={{
                select: true,
                label: 'Notification level',
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
            title={'Background'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables background banner notifications.'}
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
            title={'Popup'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables banner notifications when the popup is open.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch controllerProps={{ name: 'scope.popup', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Completed tasks'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables banner for completed tasks.'}
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
            title={'Failed tasks'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables banner for failed tasks.'}
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
            Save
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
