import type { NotificationSettings, NotificationsSnack } from '../../../../models/settings.model';

import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, InputAdornment, MenuItem, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { NotificationLevel, NotificationLevelKeys } from '../../../../models/notification.model';
import { defaultNotifications, NotificationHeader } from '../../../../models/settings.model';
import { syncNotifications } from '../../../../store/actions/settings.action';
import { getNotifications } from '../../../../store/selectors/settings.selector';
import { useI18n } from '../../../../utils/webex.utils';
import { ButtonWithConfirm } from '../../../common/button/button-with-confirm';
import { FormInput } from '../../../common/form/form-input';
import { FormSwitch } from '../../../common/form/form-switch';

export function SettingsSnack() {
  const i18n = useI18n('panel', 'settings', 'snack');
  const dispatch = useDispatch();
  const notifications: NotificationSettings = useSelector(getNotifications);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitted },
  } = useForm<NotificationsSnack>({ mode: 'onChange', defaultValues: { ...defaultNotifications.snack, ...(notifications?.snack ?? {}) } });

  const onSubmit = (snack: NotificationsSnack) => {
    dispatch(syncNotifications({ ...notifications, snack }));
    reset(snack, { keepIsSubmitted: true, keepSubmitCount: true });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <CardHeader
        id={NotificationHeader.snack}
        title={i18n('title')}
        subheader={i18n('subheader')}
        slotProps={{ title: { variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }, subheader: { variant: 'subtitle2' } }}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Collapse in={getValues()?.enabled} unmountOnExit>
          <CardHeader
            title={i18n('position_title')}
            subheader={i18n('position_subheader')}
            slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
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
              {['top', 'bottom'].map(position => (
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
              {['left', 'center', 'right'].map(position => (
                <MenuItem key={position} value={position} sx={{ textTransform: 'capitalize' }}>
                  {position}
                </MenuItem>
              ))}
            </FormInput>
          </Box>
          <CardHeader
            title={i18n('timeout_title')}
            subheader={i18n('timeout_subheader')}
            slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
            action={(
              <FormInput
                controllerProps={{
                  name: 'timeout',
                  control,
                  rules: {
                    min: { value: 500, message: i18n({ key: 'min', substitutions: ['500'] }, 'common', 'error') },
                    max: { value: 60000, message: i18n({ key: 'max', substitutions: ['60000'] }, 'common', 'error') },
                  },
                }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('timeout_label'),
                  slotProps: {
                    input: { endAdornment: <InputAdornment position="end">ms</InputAdornment> },
                  },
                  disabled: !getValues()?.enabled,
                  sx: { flex: '0 0 14rem', ml: '0.5rem' },
                }}
              />
            )}
            sx={{ p: '0.5rem 0', mt: '0.5rem' }}
          />
          <CardHeader
            title={i18n('level_title')}
            subheader={i18n('level_subheader')}
            slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
            action={(
              <FormInput
                controllerProps={{ name: 'level', control }}
                textFieldProps={{
                  select: true,
                  label: i18n('level_label'),
                  sx: { flex: '0 0 14rem', textTransform: 'capitalize', ml: '2rem' },
                  disabled: !getValues()?.enabled,
                }}
              >
                {[NotificationLevel.debug, NotificationLevel.info, NotificationLevel.warn, NotificationLevel.error].map(level => (
                  <MenuItem key={level} value={level} sx={{ textTransform: 'capitalize' }}>
                    {NotificationLevelKeys[level]}
                  </MenuItem>
                ))}
              </FormInput>
            )}
            sx={{ p: '0.5rem 0' }}
          />
          <Card sx={{ p: '0.5rem 1rem', m: '0.5rem 0' }}>
            <CardHeader
              title={i18n('popup_title')}
              subheader={i18n('popup_subheader')}
              slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
              action={(
                <FormSwitch
                  controllerProps={{ name: 'scope.popup', control }}
                  formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
                />
              )}
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('tab_title')}
              subheader={i18n('tab_subheader')}
              slotProps={{ title: { variant: 'subtitle2' }, subheader: { variant: 'subtitle2' } }}
              action={(
                <FormSwitch
                  controllerProps={{ name: 'scope.content', control }}
                  formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
                />
              )}
              sx={{ p: '0.5rem 0' }}
            />
          </Card>
        </Collapse>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultNotifications.snack)}
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
}
