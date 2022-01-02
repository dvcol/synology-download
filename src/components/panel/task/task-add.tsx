import React, { useEffect } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, CardProps, Grid, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { QueryService } from '../../../services';
import { FormExplorer, FormInput, FormSwitch } from '../../form';
import { firstValueFrom } from 'rxjs';
import { TaskForm, TaskFormValid } from '../../../models';

export const TaskAdd = ({
  form,
  withCancel,
  onFormCancel,
  onFormSubmit,
  cardProps,
}: {
  form?: TaskForm;
  withCancel?: boolean;
  onFormCancel?: (form: TaskForm) => void;
  onFormSubmit?: (form: TaskFormValid) => void;
  cardProps?: CardProps;
}) => {
  const [path, setPath] = React.useState<string>(form?.destination?.path ?? '');

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { isValid, isDirty, isSubmitted, isSubmitSuccessful },
  } = useForm<TaskForm>({
    mode: 'onChange',
    defaultValues: {
      uri: form?.uri ?? '',
      source: form?.source ?? 'Custom Task',
      destination: { custom: form?.destination?.custom ?? false, path: path ?? '' },
      username: form?.username ?? '',
      password: form?.password ?? '',
      unzip: form?.unzip ?? '',
    },
  });

  // TODO move to store init
  useEffect(() => {
    if (!path?.length && QueryService.isReady) {
      QueryService.config().subscribe(({ default_destination: _path }) => {
        reset({ ...getValues(), destination: { ...getValues()?.destination, path: _path } });
        setPath(_path);
      });
    }
  }, []);

  const onCancel = (data: TaskForm = getValues()) => {
    onFormCancel && onFormCancel(data);
  };

  const onSubmit = (data: TaskFormValid) => {
    const { uri, source, destination, username, password, unzip } = data;

    if (uri?.length) {
      return firstValueFrom(
        QueryService.createTask(
          uri,
          source,
          destination?.custom ? destination?.path : undefined,
          username?.length ? username : undefined,
          password?.length ? password : undefined,
          unzip?.length ? unzip : undefined
        )
      ).then(() => {
        reset(data);
        onFormSubmit && onFormSubmit(data);
      });
    } else {
      return Promise.reject('Url is required');
    }
  };

  const onSubmitColor = () => {
    if (!isSubmitted || isDirty) return 'info';
    return isSubmitSuccessful ? 'success' : 'error';
  };

  return (
    <Card raised={true} {...cardProps}>
      <CardHeader
        title={'Add custom download task'}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', fontSize: '16px' }}
        subheader={'Submitted tasks will be added to your download station.'}
        subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '14px' }}
        sx={{ p: '16px 16px 0', textTransform: 'capitalize' }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'row', p: '8px 16px 16px' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CardHeader
              title={'Source'}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '14px' }}
              subheader={'Tasks may fail if submitted without the required fields.'}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '12px' }}
              sx={{ p: '8px 0' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', p: '8px 0' }}>
              <FormInput
                controllerProps={{ name: 'uri', control, rules: { required: true, minLength: 1 } }}
                textFieldProps={{
                  label: 'Download url or magnet link',
                  multiline: true,
                  rows: 4,
                  inputProps: { style: { fontSize: '14px' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'username', control }}
                textFieldProps={{
                  label: 'FTP or HTTP username',
                  inputProps: { style: { fontSize: '14px' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'password', control }}
                textFieldProps={{
                  type: 'password',
                  label: 'FTP or HTTP password',
                  inputProps: { style: { fontSize: '14px' } },
                }}
                iconProps={{ sx: { fontSize: '20px' } }}
              />
              <FormInput
                controllerProps={{ name: 'unzip', control }}
                textFieldProps={{
                  type: 'password',
                  label: 'Unzip password',
                  inputProps: { style: { fontSize: '14px' } },
                }}
                iconProps={{ sx: { fontSize: '20px' } }}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <CardHeader
              title={'Destination folder'}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '14px' }}
              subheader={'Change default destination folder.'}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '12px' }}
              action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
              sx={{ p: '8px 0' }}
            />
            <Card sx={{ p: '8px', m: '8px 0', height: '320px' }}>
              <FormExplorer
                controllerProps={{ name: 'destination.path', control }}
                explorerProps={{ flatten: true, disabled: !getValues()?.destination?.custom, startPath: path }}
              />
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 24px 24px' }}>
        <Stack direction="row" spacing={2}>
          {withCancel && (
            <Button variant="outlined" color={'secondary'} sx={{ width: '80px', fontSize: '12px' }} onClick={() => onCancel()}>
              Cancel
            </Button>
          )}
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '80px', fontSize: '12px' }}
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
