import { Box, Button, Card, CardActions, CardContent, CardHeader, InputAdornment, MenuItem, Stack } from '@mui/material';
import React from 'react';
import { NotificationHeader, NotificationLevel, NotificationLevelKeys, Notifications, NotificationsSnack } from '../../../models';
import { FormInput, FormSwitch } from '../../form';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '../../../store';
import { useForm } from 'react-hook-form';

export const SettingsSnack = () => {
  const dispatch = useDispatch();
  const notifications: Notifications = useSelector(getNotifications);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<NotificationsSnack>({ mode: 'onChange', defaultValues: notifications?.snack });

  const onSubmit = (snack: NotificationsSnack) => {
    dispatch(syncNotifications({ ...notifications, snack }));
    reset(snack);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const title = NotificationHeader.snack;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheader={'Note that snackbar banner are dependant on content script injection into tabs.'}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={'Positioning'}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheader={'Changes where the snackbar notifications are displayed from.'}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          sx={{ p: '0rem 0rem 1rem' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormInput
            controllerProps={{ name: 'position.vertical', control }}
            textFieldProps={{
              select: true,
              label: 'Vertical position',
              sx: { flex: '1 1 50%', textTransform: 'capitalize', p: '0.5rem 0.5rem 0.5rem 0' },
              disabled: !getValues()?.enabled,
            }}
          >
            {['top', 'bottom'].map((position) => (
              <MenuItem key={position} value={position} sx={{ textTransform: 'capitalize' }}>
                {position}
              </MenuItem>
            ))}
          </FormInput>
          <FormInput
            controllerProps={{ name: 'position.horizontal', control }}
            textFieldProps={{
              select: true,
              label: 'Horizontal position',
              sx: { flex: '1 1 50%', textTransform: 'capitalize', p: '0.5rem 0 0.5rem 0.5rem' },
              disabled: !getValues()?.enabled,
            }}
          >
            {['left', 'center', 'right'].map((position) => (
              <MenuItem key={position} value={position} sx={{ textTransform: 'capitalize' }}>
                {position}
              </MenuItem>
            ))}
          </FormInput>
        </Box>
        <CardHeader
          title={'Notification timeout'}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheader={'Define how long the notification is displayed before being dismissed.'}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'timeout', control, rules: { min: 500, max: 60000 } }}
              textFieldProps={{
                type: 'number',
                label: 'Display timeout',
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled,
                sx: { flex: '1 1 36ch' },
              }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
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
            title={'Popup'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables snackbar notifications within the popup.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch controllerProps={{ name: 'scope.popup', control }} formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }} />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Tab'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables snackbar notifications inside active tabs.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'scope.content', control }}
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
