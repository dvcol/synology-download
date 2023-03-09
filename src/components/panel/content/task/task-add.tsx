import { Box, Button, Card, CardActions, CardContent, CardHeader, Chip, Grid, Stack, Tooltip } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { forkJoin, lastValueFrom, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormExplorer, FormInput, FormSwitch } from '@src/components';
import type { TaskForm } from '@src/models';
import { QueryService } from '@src/services';

import type { CardProps } from '@mui/material';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';

const UrlCounts: FC<{ urls?: string[] }> = ({ urls }) => {
  const i18n = useI18n('panel', 'content', 'task', 'add');
  if (!urls?.length) return null;

  const tooltip = urls?.map((_url, i) => (
    <Box key={i} sx={{ borderTop: i ? '0.03em solid #757575' : 0, p: '0.25em' }}>
      {_url}
    </Box>
  ));

  return (
    <Tooltip arrow PopperProps={{ disablePortal: true }} title={<Box sx={{ wordBreak: 'break-all' }}>{tooltip}</Box>} sx={{ ml: '0.5rem' }}>
      <Chip
        label={
          <Box sx={{ fontSize: '1em' }}>
            <span>{urls?.length}</span>&nbsp;<span>{i18n('urls')}</span>
          </Box>
        }
        size="small"
        variant="outlined"
        color="primary"
      />
    </Tooltip>
  );
};

export const TaskAdd: FC<{
  form?: TaskForm;
  withCancel?: boolean;
  onFormCancel?: (form: TaskForm) => void;
  onFormSubmit?: (form: TaskForm) => void;
  cardProps?: CardProps;
}> = ({ form, withCancel, onFormCancel, onFormSubmit, cardProps }) => {
  const i18n = useI18n('panel', 'content', 'task', 'add');
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

  const [urls, setUrls] = useState<string[]>();

  const parseUrls = (uri?: string) =>
    setUrls(
      uri
        ?.split(/\r?\n/)
        ?.map(_uri => _uri?.trim())
        .filter(Boolean),
    );

  const createTask = (_uri: string, data: TaskForm) => {
    const { source, destination, username, password, unzip } = data;
    return QueryService.createTask(
      _uri,
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
    );
  };

  const onSubmit: SubmitHandler<TaskForm> = data => {
    if (urls?.length) return lastValueFrom(forkJoin(urls.map(_uri => createTask(_uri, data))));
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
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', fontSize: '1em' }}
        subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.875em' }}
        sx={{ p: '1em 1em 0', textTransform: 'capitalize' }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'row', p: '0.5em 1em 0.75em', fontSize: '1em' }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CardHeader
              title={i18n('source_title')}
              subheader={i18n('source_subheader')}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '0.875em' }}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.75em' }}
              action={<UrlCounts urls={urls} />}
              sx={{ p: '0.5em 0' }}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.25em', p: '0.5em 0', fontSize: '0.9em', margin: '0.5em 0' }}>
              <FormInput
                controllerProps={{
                  name: 'uri',
                  control,
                  rules: {
                    required: { value: true, message: i18n('required', 'common', 'error') },
                    validate: (_uri?: string) => !!_uri?.trim()?.length || i18n('required', 'common', 'error'),
                  },
                }}
                textFieldProps={{
                  label: i18n('url_label'),
                  multiline: true,
                  rows: 4,
                  onChange: e => parseUrls(e.target.value),
                  inputProps: { style: { fontSize: '0.875em', wordBreak: 'break-all' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'username', control }}
                textFieldProps={{
                  label: i18n('username_label'),
                  inputProps: { style: { fontSize: '0.875em' } },
                }}
              />
              <FormInput
                controllerProps={{ name: 'password', control }}
                textFieldProps={{
                  type: 'password',
                  label: i18n('ftp_password_label'),
                  inputProps: { style: { fontSize: '0.875em' } },
                }}
                iconProps={{ sx: { fontSize: '1em' } }}
              />
              <FormInput
                controllerProps={{ name: 'unzip', control }}
                textFieldProps={{
                  type: 'password',
                  label: i18n('zip_password_label'),
                  inputProps: { style: { fontSize: '0.875em' } },
                }}
                iconProps={{ sx: { fontSize: '1em' } }}
              />
            </Box>
          </Grid>
          <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader
              title={i18n('destination_title')}
              subheader={i18n('destination_subheader')}
              titleTypographyProps={{ variant: 'subtitle2', fontSize: '0.875em' }}
              subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.75em' }}
              action={<FormSwitch controllerProps={{ name: 'destination.custom', control }} formControlLabelProps={{ label: '' }} />}
              sx={{ p: '0.5em 0' }}
            />
            <Card sx={{ p: '0.5em', flex: '1 1 auto', m: '0.5em 0', height: '20em' }}>
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
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5em 1em' }}>
        <Stack direction="row" spacing={2}>
          {withCancel && (
            <Button variant="outlined" color={'secondary'} sx={{ width: '5em', fontSize: '0.75em' }} onClick={() => onCancel()}>
              {i18n('cancel', 'common', 'buttons')}
            </Button>
          )}
          <Button
            variant="outlined"
            color={onSubmitColor()}
            sx={{ width: '5em', fontSize: '0.75em' }}
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
