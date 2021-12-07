import { Box, Button, Card, CardActions, CardContent, CardHeader, InputAdornment, Stack } from '@mui/material';
import React from 'react';
import { ConnectionHeader, Polling } from '../../../models';
import { useDispatch, useSelector } from 'react-redux';
import { getPolling, syncPolling } from '../../../store';
import { RegisterOptions, useForm } from 'react-hook-form';
import { FormInput } from '../../form/form-input';
import { FormSwitch } from '../../form/form-switch';

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

  // TODO fix UI
  const title = ConnectionHeader.polling;
  return (
    <Card raised={true}>
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormSwitch controllerProps={{ name: 'enabled', control }} formControlLabelProps={{ label: 'Enable periodic polling' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormSwitch
              controllerProps={{ name: 'popup.enabled', control }}
              formControlLabelProps={{ label: 'Enable popup polling', disabled: !getValues()?.enabled }}
            />
            <FormInput
              controllerProps={{ name: 'popup.interval', control, rules: rules.interval }}
              textFieldProps={{
                type: 'number',
                label: 'Interval',
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled || !getValues()?.popup?.enabled,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormSwitch
              controllerProps={{ name: 'background.enabled', control }}
              formControlLabelProps={{ label: 'Enable background polling', disabled: !getValues()?.enabled }}
            />
            <FormInput
              controllerProps={{ name: 'background.interval', control, rules: rules.interval }}
              textFieldProps={{
                type: 'number',
                label: 'Interval',
                InputProps: {
                  endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                },
                disabled: !getValues()?.enabled || !getValues()?.background?.enabled,
              }}
            />
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color={isDirty ? 'primary' : isSubmitSuccessful ? 'success' : 'info'}
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
