import { Box, Button, Card, CardActions, CardContent, CardHeader, Grid, MenuItem, Stack } from '@mui/material';
import React from 'react';
import {
  ColorLevel,
  defaultNotifications,
  defaultTabs,
  getColorFromLevel,
  getLevelFromColor,
  NotificationHeader,
  Notifications,
  NotificationsCount,
  TabType,
  TaskStatus,
  TaskTab,
} from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, syncNotifications } from '../../../store';
import { useForm } from 'react-hook-form';
import { FormCheckbox, FormInput, FormSwitch } from '../../form';

export const SettingsTasksCount = () => {
  const dispatch = useDispatch();
  const notifications: Notifications = useSelector(getNotifications);

  const getTaskTab = (type?: TabType | string): TaskTab | undefined => defaultTabs.find((t) => t.name === type);

  const getTemplateStatuses = (taskTab?: TaskTab): TaskStatus[] => (taskTab?.status?.length ? taskTab?.status : defaultNotifications.count.status);

  const [templateStatuses, setTemplateStatuses] = React.useState<TaskStatus[]>(getTemplateStatuses(getTaskTab(notifications?.count?.template)));
  const [badgeColor, setBadgeColor] = React.useState<string>(notifications?.count?.color ?? defaultNotifications.count.color);

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

  const onTemplateChange = (type: string) => {
    const tab = getTaskTab(type);
    const status = getTemplateStatuses(tab);
    setTemplateStatuses(status);
    const color = getColorFromLevel(tab?.color) ?? defaultNotifications.count.color;
    setBadgeColor(color);
    reset({ ...getValues(), status, color });
    console.log(type, tab, color);
  };

  const getHighlightColor = (s: TaskStatus): ColorLevel => {
    const color = getLevelFromColor(badgeColor);
    return color && templateStatuses?.includes(s) ? color : ColorLevel.primary;
  };

  const title = NotificationHeader.count;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <CardHeader
            title={'Base template'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Select a template to filter tasks status'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'template', control }}
                textFieldProps={{
                  select: true,
                  label: 'Template',
                  sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
                  disabled: !getValues()?.enabled,
                  onChange: (e) => onTemplateChange(e.target.value),
                }}
              >
                {Object.values(TabType).map((tab) => (
                  <MenuItem key={tab} value={tab} sx={{ textTransform: 'capitalize' }}>
                    {tab}
                  </MenuItem>
                ))}
              </FormInput>
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Badge color'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Change the badge color to reflect task types.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'color', control }}
                textFieldProps={{
                  select: true,
                  label: 'Badge color',
                  sx: { flex: '0 0 14rem', textTransform: 'capitalize' },
                  color: getLevelFromColor(badgeColor),
                  onChange: (e) => setBadgeColor(e.target.value),
                  focused: true,
                  disabled: !getValues()?.enabled,
                }}
              >
                {Object.values(ColorLevel).map((color) => (
                  <MenuItem key={color} value={getColorFromLevel(color)} sx={{ textTransform: 'capitalize' }}>
                    {color}
                  </MenuItem>
                ))}
                <MenuItem key={'default'} value={defaultNotifications.count.color} sx={{ textTransform: 'capitalize' }}>
                  Chrome Default
                </MenuItem>
              </FormInput>
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Task statuses'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Select statuses to include in the selection'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            sx={{ p: '0.5rem 0' }}
          />
          <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
            <Grid container spacing={1} columnSpacing={1}>
              {Object.values(TaskStatus).map((s) => (
                <Grid item xs={4} lg={2} key={s}>
                  <Button disableTouchRipple={true} sx={{ p: '0 0 0 0.5rem' }} color={getHighlightColor(s)} disabled={!getValues()?.enabled}>
                    <FormCheckbox
                      controllerProps={{ name: 'status', control }}
                      formControlLabelProps={{ label: s, sx: { textTransform: 'capitalize' } }}
                      checkboxProps={{
                        multiple: true,
                        value: s,
                        color: getHighlightColor(s),
                        disabled: !getValues()?.enabled,
                      }}
                    />
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Card>
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
