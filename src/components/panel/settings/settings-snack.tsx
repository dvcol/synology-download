import { Box, Button, Card, CardActions, CardContent, CardHeader, InputAdornment, MenuItem, Stack } from '@mui/material';
import React from 'react';
import { NotificationHeader, NotificationLevel, NotificationLevelKeys, Notifications, NotificationsSnack } from '@src/models';
import { FormInput, FormSwitch } from '@src/components';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '@src/store';
import { useForm } from 'react-hook-form';
import { useI18n } from '@src/utils';

export const SettingsSnack = () => {
  const i18n = useI18n('panel', 'settings', 'snack');
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

  return (
    <Card raised={true}>
      <CardHeader
        id={NotificationHeader.snack}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <CardHeader
          title={i18n('position_title')}
          subheader={i18n('position_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          sx={{ p: '0rem 0rem 1rem' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FormInput
            controllerProps={{ name: 'position.vertical', control }}
            textFieldProps={{
              select: true,
              label: i18n('position_vertical_label'),
              sx: { flex: '1 1 50%', textTransform: 'capitalize', mr: '0.25rem' },
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
              label: i18n('position_horizontal_label'),
              sx: { flex: '1 1 50%', textTransform: 'capitalize', ml: '0.25rem' },
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
          title={i18n('timeout_title')}
          subheader={i18n('timeout_subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'timeout', control, rules: { min: 500, max: 60000 } }}
              textFieldProps={{
                type: 'number',
                label: i18n('timeout_label'),
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled,
                sx: { flex: '0 0 14rem' },
              }}
            />
          }
          sx={{ p: '0.5rem 0' }}
        />
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
            title={i18n('tab_title')}
            subheader={i18n('tab_subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
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
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
