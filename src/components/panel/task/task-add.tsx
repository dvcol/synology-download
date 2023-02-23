import { Box, Button, Card, CardActions, CardContent, CardHeader, Grid, Stack } from '@mui/material';

import React, { useEffect } from 'react';

import { useForm } from 'react-hook-form';

import { lastValueFrom, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormExplorer, FormInput, FormSwitch } from '@src/components';
import type { TaskForm } from '@src/models';
import { QueryService } from '@src/services';

import type { CardProps } from '@mui/material';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';

export const TaskAdd: FC<{
  form?: TaskForm;
  withCancel?: boolean;
  onFormCancel?: (form: TaskForm) => void;
  onFormSubmit?: (form: TaskForm) => void;
  cardProps?: CardProps;
}> = ({ form, withCancel, onFormCancel, onFormSubmit, cardProps }) => {
  const i18n = useI18n('panel', 'task', 'add');
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

  useEffect(() => {
    if (!path?.length && QueryService.isLoggedIn) {
      QueryService.getConfig().subscribe(({ default_destination: _path }) => {
        reset({ ...getValues(), destination: { ...getValues()?.destination, path: _path } });
        setPath(_path);
      });
    }
  }, []);

  const onCancel = (data: TaskForm = getValues()) => {
    onFormCancel?.(data);
  };

  const onSubmit: SubmitHandler<TaskForm> = data => {
    const { uri, source, destination, username, password, unzip } = data;

    if (uri?.length) {
      return lastValueFrom(
        QueryService.createTask(
          uri,
          source,
          destination?.custom ? destination?.path : undefined,
          username?.length ? username : undefined,
          password?.length ? password : undefined,
          unzip?.length ? unzip : undefined,
        ).pipe(
          tap(() => {
            reset(data);
            onFormSubmit?.(data);
          }),
        ),
      );
    }
    return Promise.reject(i18n('url_required'));
  };

  const onSubmitColor = () => {
    if (!isSubmitted || isDirty) return 'info';
    return isSubmitSuccessful ? 'success' : 'error';
  };

  return (
    <Card raised={true} {...cardProps}>
      <CardHeader
        title={i18n('title')}
        subheader={i18n('subheader')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', fontSize: '1rem' }}
        subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.875rem' }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'row', p: '0.5rem 1rem 1rem' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CardHeader
              title={i18n('source_title')}
              subheader={i18n('source_subheader')}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '0.875rem' }}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.75rem' }}
              sx={{ p: '0.5rem 0' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', p: '0.5rem 0' }}>
              <FormInput
                controllerProps={{ name: 'uri', control, rules: { required: true, minLength: 1 } }}
                textFieldProps={{
                  label: i18n('url_label'),
                  multiline: true,
                  rows: 4,
                  inputProps: { style: { fontSize: '0.875rem' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'username', control }}
                textFieldProps={{
                  label: i18n('username_label'),
                  inputProps: { style: { fontSize: '0.875rem' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'password', control }}
                textFieldProps={{
                  type: 'password',
                  label: i18n('ftp_password_label'),
                  inputProps: { style: { fontSize: '0.875rem' } },
                }}
                iconProps={{ sx: { fontSize: '1.25rem' } }}
              />
              <FormInput
                controllerProps={{ name: 'unzip', control }}
                textFieldProps={{
                  type: 'password',
                  label: i18n('zip_password_label'),
                  inputProps: { style: { fontSize: '0.875rem' } },
                }}
                iconProps={{ sx: { fontSize: '1.25rem' } }}
              />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <CardHeader
              title={i18n('destination_title')}
              subheader={i18n('destination_subheader')}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '0.875rem' }}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.75rem' }}
              action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
              sx={{ p: '0.5rem 0' }}
            />
            <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '31.25rem' }}>
              <FormExplorer
                controllerProps={{ name: 'destination.path', control }}
                explorerProps={{
                  flatten: true,
                  disabled: !getValues()?.destination?.custom,
                  startPath: path,
                  editable: true,
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          {withCancel && (
            <Button variant="outlined" color={'secondary'} sx={{ width: '5rem', fontSize: '0.75rem' }} onClick={() => onCancel()}>
              {i18n('cancel', 'common', 'buttons')}
            </Button>
          )}
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5rem', fontSize: '0.75rem' }}
            type="submit"
            disabled={!isValid || !QueryService.isLoggedIn}
            onClick={handleSubmit(onSubmit)}
          >
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
