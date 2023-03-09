import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Container,
  InputAdornment,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { finalize, forkJoin } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import { FormExplorer, FormInput, FormSwitch } from '@src/components';
import type { DownloadStationConfig, DownloadStationInfo } from '@src/models';
import { ColorLevel, ColorLevelMap, defaultConfig } from '@src/models';
import { NotificationService, QueryService } from '@src/services';
import { before, useDebounceObservable } from '@src/utils';

import type { CardProps } from '@mui/material';
import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { Observable } from 'rxjs';

export const Config: FC<{
  cardProps?: CardProps;
}> = ({ cardProps }) => {
  const i18n = useI18n('panel', 'config');
  const {
    handleSubmit,
    reset,
    control,
    getValues,
    formState: { isValid, isDirty },
  } = useForm<DownloadStationConfig>({ mode: 'onChange', defaultValues: defaultConfig });

  const rules = {
    min: {
      value: 0,
      message: i18n({ key: 'min', substitutions: ['0'] }, 'common', 'error'),
    },
  };

  const [isAdmin, setAdmin] = useState<boolean>(false);

  const [error, setError] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBar, setLoadingBar] = useState<boolean>(false);

  // Loading observable for debounce
  const [, next] = useDebounceObservable<boolean>(setLoadingBar);
  const loadingOperator = <T,>(source: Observable<T>) =>
    source.pipe<T, T>(
      before(() => {
        setError(undefined);
        setLoading(true);
        next(true);
      }),
      finalize(() => {
        setLoading(false);
        setLoadingBar(false); // So there is no delay
        next(false); // So that observable data is not stale
      }),
    );

  useEffect(() => {
    if (QueryService.isLoggedIn) {
      forkJoin([QueryService.getConfig(), QueryService.getInfo()])
        .pipe<[DownloadStationConfig, DownloadStationInfo]>(loadingOperator)
        .subscribe(([_config, _info]) => {
          reset(_config);
          setAdmin(!!_info?.is_manager);
        });
    }
  }, []);

  const onSubmit: SubmitHandler<DownloadStationConfig> = config => {
    QueryService.setConfig(config)
      .pipe(loadingOperator)
      .subscribe({
        complete: () => {
          setError(false);
          reset(config);
          NotificationService.info({ title: i18n('set_config__success'), success: true });
        },
        error: message => {
          setError(true);
          NotificationService.error({ title: i18n('set_config__fail'), message });
        },
      });
  };

  const onSubmitColor = () => {
    if (error === undefined || isDirty) return 'info';
    return error ? 'error' : 'success';
  };

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 3rem)', overflow: 'auto' }} maxWidth={false}>
      <Card raised={true} {...cardProps} sx={{ ...cardProps?.sx, height: 'fit-content' }}>
        <LinearProgress
          sx={{
            height: '0.125rem',
            transition: 'opacity 0.3s linear',
            opacity: loadingBar ? 1 : 0,
          }}
        />
        <CardHeader
          title={i18n('title')}
          subheader={
            <Box sx={{ mt: '0.5rem' }}>
              {!loading && !isAdmin && (
                <Typography color={ColorLevelMap[ColorLevel.warning]} sx={{ mb: '0.5rem' }}>
                  {i18n('not_admin')}
                </Typography>
              )}
              <Typography sx={{ mb: '0.5rem' }}>{i18n('subheader_line_1')}</Typography>
              <Typography sx={{ mb: '0.5rem' }}>{i18n('subheader_line_2')}</Typography>
            </Box>
          }
          titleTypographyProps={{ variant: 'h6', color: 'text.primary', fontSize: '1rem' }}
          subheaderTypographyProps={{ variant: 'subtitle2', fontSize: '0.875rem' }}
          sx={{ p: '1rem 1rem 0' }}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', p: '0.5rem 1rem 1rem' }}>
          <CardHeader
            title={i18n('bt_max_download__title')}
            subheader={i18n('bt_max_download__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'bt_max_download', control, rules }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('bt_max_download__label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                  },
                  disabled: !isAdmin,
                  sx: { flex: '0 0 14rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('bt_max_upload__title')}
            subheader={i18n('bt_max_upload__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'bt_max_upload', control, rules }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('bt_max_upload__label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                  },
                  disabled: !isAdmin,
                  sx: { flex: '0 0 14rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('nzb_max_download__title')}
            subheader={i18n('nzb_max_download__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'nzb_max_download', control, rules }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('nzb_max_download__label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                  },
                  disabled: !isAdmin,
                  sx: { flex: '0 0 14rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('http_max_download__title')}
            subheader={i18n('http_max_download__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'http_max_download', control, rules }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('http_max_download__label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                  },
                  disabled: !isAdmin,
                  sx: { flex: '0 0 14rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('ftp_max_download__title')}
            subheader={i18n('ftp_max_download__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormInput
                controllerProps={{ name: 'ftp_max_download', control, rules }}
                textFieldProps={{
                  type: 'number',
                  label: i18n('ftp_max_download__label'),
                  InputProps: {
                    endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                  },
                  disabled: !isAdmin,
                  sx: { flex: '0 0 14rem' },
                }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('unzip_service_enabled__title')}
            subheader={i18n('unzip_service_enabled__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={<FormSwitch controllerProps={{ name: 'unzip_service_enabled', control }} formControlLabelProps={{ label: '' }} />}
            sx={{ p: '0.5rem 0' }}
          />
          <CardHeader
            title={i18n('default_destination__title')}
            subheader={i18n('default_destination__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            sx={{ p: '0.5rem 0' }}
          />
          <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '12rem' }}>
            <FormExplorer
              controllerProps={{ name: 'default_destination', control }}
              explorerProps={{ flatten: true, disabled: !isAdmin, startPath: getValues()?.default_destination }}
            />
          </Card>
          <CardHeader
            title={i18n('emule_enabled__title')}
            subheader={i18n('emule_enabled__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={<FormSwitch controllerProps={{ name: 'emule_enabled', control }} formControlLabelProps={{ label: '' }} />}
            sx={{ p: '0.5rem 0' }}
          />
          <Collapse in={getValues()?.emule_enabled} unmountOnExit>
            <CardHeader
              title={i18n('emule_max_download__title')}
              subheader={i18n('emule_max_download__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{ name: 'emule_max_download', control, rules }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('emule_max_download__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                    },
                    disabled: !isAdmin || !getValues().emule_enabled,
                    sx: { flex: '0 0 14rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('emule_max_upload__title')}
              subheader={i18n('emule_max_upload__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              action={
                <FormInput
                  controllerProps={{ name: 'emule_max_upload', control, rules }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('emule_max_upload__label'),
                    InputProps: {
                      endAdornment: <InputAdornment position="end">KB/s</InputAdornment>,
                    },
                    disabled: !isAdmin || !getValues().emule_enabled,
                    sx: { flex: '0 0 14rem' },
                  }}
                />
              }
              sx={{ p: '0.5rem 0' }}
            />
            <CardHeader
              title={i18n('emule_default_destination__title')}
              subheader={i18n('emule_default_destination__subheader')}
              titleTypographyProps={{ variant: 'subtitle2' }}
              subheaderTypographyProps={{ variant: 'subtitle2' }}
              sx={{ p: '0.5rem 0' }}
            />
            <Card sx={{ p: '0.5rem', m: '0.5rem 0', height: '12rem' }}>
              <FormExplorer
                controllerProps={{ name: 'emule_default_destination', control }}
                explorerProps={{
                  flatten: true,
                  disabled: !isAdmin || !getValues().emule_enabled,
                  startPath: getValues()?.emule_default_destination,
                }}
              />
            </Card>
          </Collapse>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              color={onSubmitColor()}
              sx={{ width: '5rem', fontSize: '0.75rem' }}
              type="submit"
              disabled={!isAdmin || !isValid || loading || !QueryService.isLoggedIn}
              onClick={handleSubmit(onSubmit)}
            >
              {i18n('save', 'common', 'buttons')}
            </Button>
          </Stack>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Config;
