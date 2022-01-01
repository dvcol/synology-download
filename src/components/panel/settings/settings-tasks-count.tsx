import { Box, Button, Card, CardActions, CardContent, CardHeader, Stack } from '@mui/material';
import React from 'react';
import { defaultNotifications, NotificationHeader, Notifications, NotificationsCount, Tab } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '../../../store';
import { useForm } from 'react-hook-form';
import { FormSwitch, FormTab } from '../../form';
import { Control } from 'react-hook-form/dist/types/form';

export const SettingsTasksCount = () => {
  const dispatch = useDispatch();
  const notifications: Notifications = useSelector(getNotifications);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<NotificationsCount>({ mode: 'onChange', defaultValues: notifications?.count });

  const onSubmit = (count: NotificationsCount) => {
    dispatch(syncNotifications({ ...notifications, count }));
    reset(count);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const title = NotificationHeader.count;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <FormTab
            useFormProps={{ control: control as Control<Tab>, getValues, reset }}
            tab={{
              template: notifications?.count?.template,
              color: notifications?.count?.color ?? defaultNotifications.count.color,
              status: notifications?.count?.status ?? defaultNotifications.count.status,
            }}
            disabled={!getValues()?.enabled}
          />
        </Box>
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
