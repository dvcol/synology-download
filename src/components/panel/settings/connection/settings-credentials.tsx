import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, LinearProgress, MenuItem, Stack, Typography } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { finalize, lastValueFrom } from 'rxjs';

import { ButtonWithConfirm, FormCheckbox, FormInput, FormSwitch } from '@src/components';
import type { ConnectionSettings, Credentials, FormRules, InfoResponse, LoginResponse } from '@src/models';
import { AppLinks, ColorLevel, ColorLevelMap, CommonAPI, ConnectionHeader, ConnectionType, defaultConnection, Protocol } from '@src/models';
import { LoggerService, NotificationService, PollingService, QueryService } from '@src/services';
import { syncConnection } from '@src/store/actions';
import { getConnection, getLogged, urlReducer } from '@src/store/selectors';
import { before, createTab, useDebounceObservable, useI18n } from '@src/utils';

import type { Observable } from 'rxjs';

export const SettingsCredentials = () => {
  const i18n = useI18n('panel', 'settings', 'credentials');

  const dispatch = useDispatch();
  const connection = useSelector(getConnection);
  const logged = useSelector(getLogged);

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { isValid, isDirty, isSubmitted, dirtyFields },
  } = useForm<ConnectionSettings>({
    mode: 'onChange',
    defaultValues: {
      ...defaultConnection,
      password: '',
      enable_device_token: false,
      device_name: i18n('app_name', 'global'),
      device_id: '',
      ...connection,
      otp_code: '',
    },
  });

  const authVersion = watch('authVersion') ?? defaultConnection.authVersion ?? 3;
  const isAuthV6 = authVersion >= 6;
  const type = watch('type');
  const isQC = type === ConnectionType.quickConnect;
  const is2FA = type === ConnectionType.twoFactor;
  const port = watch('port');
  const protocol = watch('protocol');

  const rules: FormRules<ConnectionSettings> = {
    type: { required: { value: true, message: i18n('required', 'common', 'error') } },
    protocol: { required: { value: true, message: i18n('required', 'common', 'error') } },
    path: { required: { value: true, message: i18n('required', 'common', 'error') } },
    port: {
      required: { value: !isQC, message: i18n('required', 'common', 'error') },
      min: { value: 0, message: i18n({ key: 'min_short', substitutions: ['0'] }, 'common', 'error') },
      max: { value: 65535, message: i18n({ key: 'max_short', substitutions: ['65535'] }, 'common', 'error') },
    },
    username: { required: { value: true, message: i18n('required', 'common', 'error') } },
    password: { required: { value: true, message: i18n('required', 'common', 'error') } },
    otp_code: { required: { value: is2FA && !logged, message: i18n('required', 'common', 'error') } },
    device_name: { required: { value: !!(is2FA && getValues().enable_device_token), message: i18n('required', 'common', 'error') } },
  };

  type LoginError = { test?: boolean; login?: boolean };
  const [loginError, setLoginError] = useState<LoginError>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBar, setLoadingBar] = useState<boolean>(false);

  // Loading observable for debounce
  const [, next] = useDebounceObservable<boolean>(setLoadingBar);

  const loadingOperator = (source: Observable<any>) =>
    source.pipe(
      before(() => {
        setLoginError({});
        setLoading(true);
        next(true);
      }),
      finalize(() => {
        setLoading(false);
        setLoadingBar(false); // So there is no delay
        next(false); // So that observable data is not stale
      }),
    );

  const [hasInfo, setInfo] = useState<InfoResponse>();
  const queryInfo = (baseUrl?: string) =>
    lastValueFrom(QueryService.info(baseUrl, true).pipe(loadingOperator))
      .then(res => {
        setInfo(res);
        const _version = res[CommonAPI.Auth]?.maxVersion ?? defaultConnection.authVersion;
        setValue('authVersion', _version);
        if (_version < 6) setValue('enable_device_token', false);
        return _version;
      })
      .catch(err => LoggerService.error('Failed to query info', err));

  useEffect(() => {
    PollingService.stop();
    if (QueryService.isReady) queryInfo().then();
    return () => PollingService.start();
  }, []);

  const buildUrl = (data: ConnectionSettings, _type: keyof LoginError): string | undefined => {
    try {
      return urlReducer(data);
    } catch (error) {
      setLoginError({ ...loginError, [_type]: true });
      NotificationService.debug({ title: i18n('build_url__fail'), message: JSON.stringify(error) });
    }
  };

  const syncOnSubscribe = async <T extends LoginResponse | void>(
    data: ConnectionSettings,
    query: (credentials: Credentials, basUrl?: string) => Observable<unknown>,
    _type: 'login_test' | 'login' | 'logout',
  ) => {
    const baseUrl = buildUrl(data, _type === 'login_test' ? 'test' : 'login');
    if (!baseUrl) return;
    if (!hasInfo) data.authVersion = await queryInfo(baseUrl);
    return query
      .bind(QueryService)(data, baseUrl)
      .pipe<T>(loadingOperator)
      .subscribe({
        next: res => {
          // Update device_id if found
          if (_type === 'login' && (res?.did || res?.device_id)) {
            data.device_id = res.did ?? res?.device_id;
          }
          // Purge device_id on logout
          else if (_type === 'logout') {
            data.device_id = '';
          }
          reset(data);
        },
        complete: () => {
          if (_type !== 'login_test') {
            QueryService.setBaseUrl(baseUrl);
            dispatch(syncConnection(data));
          }
          setLoginError({ ...loginError, [_type]: false });
          NotificationService.info({
            title: i18n(`${_type}__success`),
            contextMessage: urlReducer(data),
            success: true,
          });
        },
        error: (error: Error) => {
          LoggerService.error('Failed to login', error);
          setLoginError({ ...loginError, [_type]: true });
          NotificationService.error({
            title: i18n(`${_type}__fail`),
            message: error?.message ?? error?.name ?? '',
            contextMessage: urlReducer(data),
          });
        },
      });
  };

  const testLogin = (data: ConnectionSettings) => syncOnSubscribe(data, QueryService.loginTest, 'login_test');

  const loginLogout = (data: ConnectionSettings) =>
    syncOnSubscribe(data, logged ? QueryService.logout : QueryService.login, logged ? 'logout' : 'login');

  const getColor = (_type: keyof LoginError) => {
    if (loginError[_type] === undefined || isDirty) return 'info';
    return loginError[_type] ? 'error' : 'success';
  };

  const onSave = (data: ConnectionSettings) => {
    dispatch(syncConnection(data));
    reset(data, { keepIsSubmitted: true, keepSubmitCount: true });
  };

  const onSubmitColor = () => {
    if (isDirty) return 'primary';
    return isSubmitted ? 'success' : 'info';
  };

  return (
    <Card raised={true}>
      <LinearProgress
        sx={{
          height: '0.125rem',
          transition: 'opacity 0.3s linear',
          opacity: loadingBar ? 1 : 0,
        }}
      />
      <CardHeader
        id={ConnectionHeader.credential}
        title={i18n('title')}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary', sx: { textTransform: 'capitalize' } }}
        subheader={i18n('subheader')}
        subheaderTypographyProps={{ color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent sx={{ p: '0 1rem' }}>
        <CardHeader
          title={i18n('type__title')}
          subheader={i18n('type__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormInput
              controllerProps={{ name: 'type', control, rules: rules.type }}
              textFieldProps={{
                select: true,
                label: i18n('type'),
                sx: { flex: '1 0 8rem' },
                onChange: ({ target: { value } }) => {
                  if (value === ConnectionType.quickConnect) setValue('protocol', Protocol.https);
                },
              }}
            >
              {Object.values(ConnectionType)?.map(_type => (
                <MenuItem key={_type} value={_type}>
                  {i18n(_type, 'common', 'model', 'connection_type')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />

        <CardHeader
          title={i18n('general__title')}
          subheader={i18n('general__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          sx={{ p: '0.5rem 0' }}
        />
        <Collapse in={isQC} unmountOnExit={true}>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('quick_connect__alpha')}
          </Typography>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('quick_connect__no_auto_login')}
          </Typography>
        </Collapse>
        <Collapse in={!!port && port <= 1025} unmountOnExit={true}>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('quick_connect__port_min')}
          </Typography>
        </Collapse>
        <Card component="form" sx={{ p: '0.5rem', '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <Grid container direction={'row'} sx={{ alignItems: 'center' }}>
            <FormInput
              controllerProps={{ name: 'protocol', control, rules: rules.protocol }}
              textFieldProps={{
                select: true,
                label: i18n('protocol'),
                sx: { flex: '0 0 6rem' },
                disabled: isQC,
                onChange: ({ target: { value } }) => {
                  if (!dirtyFields.port) setValue('port', value === Protocol.http ? 5000 : 5001);
                },
              }}
            >
              {Object.values(Protocol)?.map(_type => (
                <MenuItem key={_type} value={_type}>
                  {i18n(_type, 'common', 'model', 'protocol')}
                </MenuItem>
              ))}
            </FormInput>

            <Typography id="protocol-path-slash" variant="body2" color="text.secondary">
              ://
            </Typography>

            <FormInput
              controllerProps={{ name: 'path', control, rules: rules.path }}
              textFieldProps={{
                type: 'text',
                label: i18n('path'),
                sx: { flex: '1 1 auto' },
              }}
            />

            {!isQC && (
              <>
                <Typography id="path-port-dot" variant="body2" color="text.secondary">
                  :
                </Typography>
                <FormInput
                  controllerProps={{ name: 'port', control, rules: rules.port }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('port'),
                    sx: { flex: '0 0 6rem' },
                    disabled: isQC,
                  }}
                />
              </>
            )}
            {isQC && (
              <Typography id="path-port-dot" variant="body2" color="text.secondary" sx={{ mr: '0.75rem', flex: '0 0 0 14ch' }}>
                .quickconnect.to
              </Typography>
            )}
          </Grid>
          <Grid container direction={'row'} sx={{ alignItems: 'center' }}>
            <FormInput
              controllerProps={{ name: 'username', control, rules: rules.username }}
              textFieldProps={{
                type: 'text',
                label: i18n('username'),
              }}
            />

            <FormInput
              controllerProps={{ name: 'password', control, rules: rules.password }}
              textFieldProps={{
                type: 'password',
                label: i18n('password'),
              }}
            />
          </Grid>
        </Card>

        <Collapse in={protocol === Protocol.https} unmountOnExit={true}>
          <Typography color={ColorLevelMap[ColorLevel.primary]} variant={'subtitle2'} sx={{ m: '0', fontSize: '0.7rem' }}>
            {i18n('https_certificate')}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              flex: '1 1 auto',
              justifyContent: 'space-around',
              p: '1rem',
            }}
          >
            <Button variant="outlined" color={ColorLevel.primary} onClick={() => createTab({ url: AppLinks.HowToCertificate })}>
              {i18n('https_how_to')}
            </Button>
            <Button variant="outlined" color={ColorLevel.warning} onClick={() => createTab({ url: urlReducer(getValues()) })}>
              {i18n('https_link')}
            </Button>
          </Stack>

          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('https_override')}
          </Typography>
          <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
            {i18n('https_auto_login')}
          </Typography>
        </Collapse>
        <Collapse in={is2FA} unmountOnExit={true}>
          <CardHeader
            title={i18n('2fa__title')}
            subheader={i18n('2fa__subheader')}
            titleTypographyProps={{ variant: 'subtitle2', mb: '0.75rem' }}
            subheaderTypographyProps={{ variant: 'subtitle2' }}
            action={
              <FormCheckbox
                controllerProps={{ name: 'enable_device_token', control, rules: rules.enable_device_token }}
                formControlLabelProps={{ label: i18n('enable_device_token'), disabled: !is2FA || !isAuthV6 }}
              />
            }
            sx={{ p: '0.5rem 0' }}
          />
          <Collapse in={is2FA && !getValues().enable_device_token} unmountOnExit={true}>
            <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
              {i18n('2fa__warning')}
            </Typography>
          </Collapse>
          <Collapse in={is2FA && !isAuthV6} unmountOnExit={true}>
            <Typography color={ColorLevelMap[ColorLevel.warning]} variant={'subtitle2'} sx={{ m: '0 0 0.75rem', fontSize: '0.7rem' }}>
              {i18n('auth_v6__warning')}
            </Typography>
          </Collapse>
          <Card component="form" sx={{ p: '0.5rem', '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
            <Grid container direction={'row'} sx={{ alignItems: 'center' }}>
              <FormInput
                controllerProps={{ name: 'device_id', control }}
                textFieldProps={{
                  type: 'text',
                  label: i18n('device_id'),
                  disabled: true,
                }}
              />
            </Grid>
            <Grid container direction={'row'} sx={{ alignItems: 'center' }}>
              <FormInput
                controllerProps={{ name: 'otp_code', control, rules: rules.otp_code }}
                textFieldProps={{
                  type: 'text',
                  label: i18n('otp_code'),
                  disabled: !is2FA,
                }}
              />
              <FormInput
                controllerProps={{
                  name: 'device_name',
                  control,
                  rules: rules.device_name,
                }}
                textFieldProps={{
                  type: 'text',
                  label: i18n('device_name'),
                  disabled: !is2FA || !getValues().enable_device_token || !isAuthV6,
                }}
              />
            </Grid>
          </Card>
        </Collapse>

        <CardHeader
          title={i18n('remember_me__title')}
          subheader={i18n('remember_me__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={<FormSwitch controllerProps={{ name: 'rememberMe', control }} formControlLabelProps={{ label: '' }} />}
          sx={{ p: '0.5rem 0' }}
        />
        <CardHeader
          title={i18n('auto_login__title')}
          subheader={i18n('auto_login__subheader')}
          titleTypographyProps={{ variant: 'subtitle2' }}
          subheaderTypographyProps={{ variant: 'subtitle2' }}
          action={
            <FormSwitch controllerProps={{ name: 'autoLogin', control }} formControlLabelProps={{ label: '', disabled: !getValues().rememberMe }} />
          }
          sx={{ p: '0.5rem 0' }}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', padding: '1rem 1rem 1.5rem' }}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flex: '1 1 auto',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            variant="outlined"
            color={getColor('test')}
            disabled={loading || !isValid || (logged && is2FA && !getValues()?.otp_code)}
            onClick={handleSubmit(testLogin)}
          >
            {i18n('login_test')}
          </Button>
          <Button
            variant="outlined"
            color={getColor('login')}
            sx={{ width: '5rem' }}
            type="submit"
            disabled={loading || !isValid}
            onClick={handleSubmit(loginLogout)}
          >
            {i18n(logged ? 'logout' : 'login')}
          </Button>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            flex: '1 1 auto',
            justifyContent: 'flex-end',
          }}
        >
          <ButtonWithConfirm
            buttonLabel={i18n('restore', 'common', 'buttons')}
            buttonProps={{ variant: 'outlined', color: 'secondary', sx: { flex: '0 1 8rem' }, startIcon: <SettingsBackupRestoreIcon /> }}
            onDialogConfirm={() => reset(defaultConnection)}
          />
          <Button variant="outlined" color={onSubmitColor()} sx={{ width: '5rem' }} type="submit" onClick={() => onSave(getValues())}>
            {i18n('save', 'common', 'buttons')}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
