import { Box, Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, LinearProgress, MenuItem, Stack, Typography } from '@mui/material';
import { SwitchBaseProps } from '@mui/material/internal/SwitchBase';

import React, { useEffect, useState } from 'react';

import { RegisterOptions, useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { finalize, lastValueFrom, Observable } from 'rxjs';

import { FormCheckbox, FormInput, FormSwitch } from '@src/components';
import {
  ColorLevel,
  ColorLevelMap,
  CommonAPI,
  Connection,
  ConnectionHeader,
  ConnectionType,
  Credentials,
  defaultConnection,
  InfoResponse,
  LoginResponse,
  Protocol,
} from '@src/models';
import { NotificationService, PollingService, QueryService } from '@src/services';
import { syncConnection, syncRememberMe } from '@src/store/actions';
import { getConnection, getLogged, urlReducer } from '@src/store/selectors';
import { before, useDebounceObservable, useI18n } from '@src/utils';

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
    formState: { isValid, isDirty },
  } = useForm<Connection>({
    mode: 'onChange',
    defaultValues: {
      ...defaultConnection,
      password: '',
      otp_code: '',
      enable_device_token: false,
      device_name: i18n('app_name', 'global'),
      device_id: '',
      ...connection,
    },
  });

  const authVersion = watch('authVersion') ?? 1;
  const isAuthV6 = authVersion >= 6;
  const type = watch('type');
  const isQC = type === ConnectionType.quickConnect;
  const is2FA = type === ConnectionType.twoFactor;

  const rules: Partial<Record<keyof Omit<Connection, 'logged' | 'rememberMe'>, RegisterOptions>> = {
    type: { required: true },
    protocol: { required: true },
    path: { required: true },
    port: { required: !isQC, min: 1025, max: 65535 },
    username: { required: true },
    password: { required: true },
    otp_code: { required: is2FA },
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
      })
    );

  const [hasInfo, setInfo] = useState<InfoResponse>();
  const queryInfo = (baseUrl?: string) =>
    lastValueFrom(QueryService.info(baseUrl).pipe(loadingOperator)).then((res) => {
      setInfo(res);
      const _version = res[CommonAPI.Auth].maxVersion;
      setValue('authVersion', _version);
      if (_version < 6) setValue('enable_device_token', false);
      return _version;
    });

  useEffect(() => {
    PollingService.stop();
    QueryService.isReady && queryInfo();
    return () => PollingService.start();
  }, []);

  const buildUrl = (data: Connection, _type: keyof LoginError): string | undefined => {
    try {
      return urlReducer(data);
    } catch (error) {
      setLoginError({ ...loginError, [_type]: true });
      NotificationService.debug({ title: i18n('build_url__fail'), message: JSON.stringify(error) });
    }
  };

  const syncOnSubscribe = async <T extends LoginResponse | void>(
    data: Connection,
    query: (credentials: Credentials, basUrl?: string) => Observable<unknown>,
    _type: 'login_test' | 'login' | 'logout'
  ) => {
    const baseUrl = buildUrl(data, _type === 'login_test' ? 'test' : 'login');
    if (!baseUrl) return;
    if (!hasInfo) data.authVersion = await queryInfo(baseUrl);
    return query
      .bind(QueryService)(data, baseUrl)
      .pipe<T>(loadingOperator)
      .subscribe({
        next: (res) => {
          // Update device_id if found
          if (_type === 'login' && res?.did) {
            data.device_id = res.did;
          }
          // Purge device_id on logout
          else if (_type === 'logout') {
            data.device_id = '';
          }
          // Clean up otp on success
          data.otp_code = '';
          reset(data);
        },
        complete: () => {
          if (_type !== 'login_test') {
            QueryService.setBaseUrl(baseUrl);
            dispatch(syncConnection(data));
          }
          setLoginError({ ...loginError, [_type]: false });
          NotificationService.info({ title: i18n(`${_type}__success`), contextMessage: urlReducer(data), success: true });
        },
        error: (error: Error) => {
          setLoginError({ ...loginError, [_type]: true });
          NotificationService.error({
            title: i18n(`${_type}__fail`),
            message: error?.message ?? error?.name ?? '',
            contextMessage: urlReducer(data),
          });
        },
      });
  };

  const testLogin = (data: Connection) => syncOnSubscribe(data, QueryService.loginTest, 'login_test');

  const loginLogout = (data: Connection) => syncOnSubscribe(data, logged ? QueryService.logout : QueryService.login, logged ? 'logout' : 'login');

  const getColor = (_type: keyof LoginError) => {
    if (loginError[_type] === undefined || isDirty) return 'info';
    return loginError[_type] ? 'error' : 'success';
  };

  const onRememberMeChange: SwitchBaseProps['onChange'] = (_, rememberMe) => dispatch(syncRememberMe(rememberMe));

  return (
    <Card raised={true}>
      <LinearProgress
        sx={{
          height: '2px',
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
              controllerProps={{ name: 'type', control, rules: rules.protocol }}
              textFieldProps={{
                select: true,
                label: i18n('type'),
                sx: { flex: '1 0 8rem' },
                onChange: ({ target: { value } }) => value === ConnectionType.quickConnect && setValue('protocol', Protocol.https),
              }}
            >
              {Object.values(ConnectionType)?.map((_type) => (
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
        <Card component="form" sx={{ p: '0.5rem', '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <Grid container direction={'row'} sx={{ alignItems: 'center' }}>
            <FormInput
              controllerProps={{ name: 'protocol', control, rules: rules.protocol }}
              textFieldProps={{
                select: true,
                label: i18n('protocol'),
                sx: { flex: '0 0 6rem' },
                disabled: isQC,
              }}
            >
              {Object.values(Protocol)?.map((_type) => (
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

        <Collapse in={is2FA} unmountOnExit={true}>
          <CardHeader
            title={i18n('2fa__title')}
            subheader={i18n('2fa__subheader')}
            titleTypographyProps={{ variant: 'subtitle2' }}
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
                controllerProps={{ name: 'otp_code', control, rules: rules.otp_code }}
                textFieldProps={{
                  type: 'text',
                  label: i18n('otp_code'),
                  disabled: !is2FA,
                }}
              />
              <FormInput
                controllerProps={{ name: 'device_name', control, rules: { required: is2FA && getValues().enable_device_token } }}
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

      <CardActions sx={{ justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
        <FormCheckbox
          controllerProps={{ name: 'rememberMe', control }}
          checkboxProps={{ onChange: onRememberMeChange }}
          formControlLabelProps={{ label: i18n('remember_me') }}
        />
        <Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color={getColor('test')} disabled={loading || !isValid} onClick={handleSubmit(testLogin)}>
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
        </Box>
      </CardActions>
    </Card>
  );
};
