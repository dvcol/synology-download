import React, { useEffect } from 'react';
import { Box, Button, Card, CardActions, CardContent, CardHeader, Container, Grid, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { QueryService } from '../../../services';
import { FormExplorer, FormInput, FormSwitch } from '../../form';
import { firstValueFrom } from 'rxjs';

type TaskForm = {
  uri?: string;
  source?: string; // Custom Task
  destination?: { custom?: boolean; path: string };
  username?: string;
  password?: string;
  unzip?: string; // unzip password
};

export const TaskAdd = ({
  form,
  withCancel,
  onFormCancel,
  onFormSubmit,
}: {
  form?: TaskForm;
  withCancel?: boolean;
  onFormCancel?: (form: TaskForm) => void;
  onFormSubmit?: (form: TaskForm) => void;
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

  // move to store init
  useEffect(() => {
    QueryService.isReady &&
      QueryService.config().subscribe(({ default_destination: _path }) => {
        reset({ ...getValues(), destination: { ...getValues()?.destination, path: _path } });
        setPath(_path);
      });
  }, []);

  const onCancel = (data: TaskForm) => {
    onFormCancel && onFormCancel(data);
  };

  const onSubmit = (data: TaskForm) => {
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
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      <Card raised={true}>
        <CardHeader
          title={'Add custom download task'}
          titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
          subheader={'Submitted tasks will be added to your download station.'}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CardHeader
                title={'Source'}
                subheader={'Note that task might fail if submitted without the required fields.'}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
                titleTypographyProps={{ variant: 'subtitle2' }}
                sx={{ p: '0.5rem 0' }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', p: '1rem 0' }}>
                <FormInput
                  controllerProps={{ name: 'uri', control, rules: { required: true, minLength: 1 } }}
                  textFieldProps={{
                    label: 'Download url or magnet link',
                  }}
                />
                <FormInput
                  controllerProps={{ name: 'username', control }}
                  textFieldProps={{
                    label: 'FTP or HTTP username',
                  }}
                />
                <FormInput
                  controllerProps={{ name: 'password', control }}
                  textFieldProps={{
                    type: 'password',
                    label: 'FTP or HTTP password',
                  }}
                />
                <FormInput
                  controllerProps={{ name: 'unzip', control }}
                  textFieldProps={{
                    type: 'password',
                    label: 'Unzip password',
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardHeader
                title={'Destination folder'}
                titleTypographyProps={{ variant: 'subtitle2' }}
                subheader={'Change default destination folder.'}
                subheaderTypographyProps={{ variant: 'subtitle2' }}
                action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
                sx={{ p: '0.5rem 0' }}
              />
              <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '17rem' }}>
                <FormExplorer
                  controllerProps={{ name: 'destination.path', control }}
                  explorerProps={{ flatten: true, disabled: !getValues()?.destination?.custom, startPath: path }}
                />
              </Card>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
          <Stack direction="row" spacing={2}>
            {withCancel && (
              <Button variant="outlined" color={'secondary'} sx={{ width: '5rem' }} onClick={handleSubmit(onCancel)}>
                Cancel
              </Button>
            )}
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
    </Container>
  );
};
