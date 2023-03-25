import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, Stack } from '@mui/material';

import React from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { ButtonWithConfirm, FormSwitch, FormTab } from '@src/components';
import type { Notifications, NotificationsCount, Tab } from '@src/models';
import { defaultNotifications, NotificationHeader } from '@src/models';
import { syncNotifications } from '@src/store/actions';
import { getNotifications } from '@src/store/selectors';
import { useI18n } from '@src/utils';

import type { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import type { Control } from 'react-hook-form/dist/types/form';

export const SettingsTasksCount = () => {
  const i18n = useI18n('panel', 'settings', 'tasks_count');
  const dispatch = useDispatch();
  const notifications: Notifications = useSelector(getNotifications);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    setValue,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<NotificationsCount>({
    mode: 'onChange',
    defaultValues: {
      ...defaultNotifications.count,
      ...notifications?.count,
      destination: { ...notifications?.count.destination, folder: notifications?.count?.destination?.folder ?? '' },
    },
  });

  const onSubmit = (count: NotificationsCount) => {
    dispatch(syncNotifications({ ...notifications, count }));
    reset(count, { keepIsSubmitted: true, keepSubmitCount: true });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={NotificationHeader.count}
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
            <FormTab
              useFormProps={{
                control: control as unknown as Control<Tab>,
                setValue: setValue as unknown as UseFormSetValue<Tab>,
                getValues: getValues as unknown as UseFormGetValues<Tab>,
              }}
              tab={{
                template: notifications?.count?.template,
                color: notifications?.count?.color ?? defaultNotifications.count.color,
                status: notifications?.count?.status ?? defaultNotifications.count.status,
                destination: notifications?.count?.destination ?? defaultNotifications.count.destination,
              }}
              disabled={!getValues()?.enabled}
            />
          </Box>
        </Collapse>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultNotifications.count)}
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
