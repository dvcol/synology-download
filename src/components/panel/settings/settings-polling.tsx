import { Box, Button, Card, CardActions, CardContent, CardHeader, InputAdornment, Stack } from '@mui/material';
import React from 'react';
import { ConnectionHeader, Polling } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getPolling, syncPolling } from '../../../store';
import { RegisterOptions, useForm } from 'react-hook-form';
import { FormInput, FormSwitch } from '../../form';

export const SettingsPolling = () => {
  const dispatch = useDispatch();
  const polling: Polling = useSelector(getPolling);

  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty, isSubmitSuccessful },
  } = useForm<Polling>({ mode: 'onChange', defaultValues: polling });

  const rules: Record<string, RegisterOptions> = {
    interval: { min: 500, max: 86400 },
  };

  const onSubmit = (data: Polling) => {
    dispatch(syncPolling(data));
    reset(data);
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitSuccessful ? 'success' : 'info';
  };

  const title = ConnectionHeader.polling;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        subheader={'Periodically polls the DiskStation to fetch tasks.'}
        action={<FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: '' }} />}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <CardHeader
            title={'Popup'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Enables or disables polling when the popup is open.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'popup.enabled', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Background'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={
              <Box>
                <Box>Enables or disables polling when the popup is open.</Box>
                <Box>Note that background polling is necessary for notification and icon count.</Box>
              </Box>
            }
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormSwitch
                controllerProps={{ name: 'background.enabled', control }}
                formControlLabelProps={{ label: '', disabled: !getValues()?.enabled }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={'Interval'}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheader={'Changes the polling interval for ask fetching.'}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            sx={{ p: '1rem 0' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <FormInput
              controllerProps={{ name: 'popup.interval', control, rules: rules.interval }}
              textFieldProps={{
                type: 'number',
                label: 'Popup interval',
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled || !getValues()?.popup?.enabled,
                sx: { flex: '1 1 30ch' },
              }}
            />
            <FormInput
              controllerProps={{ name: 'background.interval', control, rules: rules.interval }}
              textFieldProps={{
                type: 'number',
                label: 'Background interval',
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled || !getValues()?.background?.enabled,
                sx: { flex: '1 1 30ch' },
              }}
            />
          </Box>
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
