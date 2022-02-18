import { Box, Button, Card, CardActions, CardContent, CardHeader, LinearProgress, MenuItem, Stack, Typography } from '@mui/material';
import { SwitchBaseProps } from '@mui/material/internal/SwitchBase';

import React, { useEffect, useState } from 'react';

import { RegisterOptions, useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';

import { finalize, Observable } from 'rxjs';

import { FormCheckbox, FormInput } from '@src/components';
import { Connection, ConnectionHeader, ConnectionType, Protocol } from '@src/models';
import { NotificationService, PollingService, QueryService } from '@src/services';
import { setConnection, syncConnection, syncRememberMe } from '@src/store/actions';
import { getConnection, getLogged, urlReducer } from '@src/store/selectors';
import { before, useDebounceObservable, useI18n } from '@src/utils';

// TODO : 2FA & HTTPS
export const SettingsCredentials = () => {
  const i18n = useI18n('panel', 'settings', 'credentials');

  const dispatch = useDispatch();
  const connection = useSelector(getConnection);
  const logged = useSelector(getLogged);

  useEffect(() => {
    PollingService.stop();
    return () => PollingService.start();
  }, []);

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    formState: { isValid, isDirty },
  } = useForm<Connection>({
    mode: 'onChange',
    defaultValues: { type: ConnectionType.local, protocol: Protocol.http, path: '', username: '', password: '', ...connection },
  });

  const isQuickConnect = getValues().type === ConnectionType.quickConnect;

  const rules: Record<keyof Omit<Connection, 'logged' | 'rememberMe'>, RegisterOptions> = {
    type: { required: true },
    protocol: { required: true },
    path: { required: true },
    port: { required: !isQuickConnect, min: 1025, max: 65535 },
    username: { required: true },
    password: { required: true },
  };

  type LoginError = { test?: boolean; login?: boolean };
  const [loginError, setLoginError] = useState<LoginError>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBar, setLoadingBar] = useState<boolean>(false);

  // Loading observable for debounce
  const loadingBar$ = useDebounceObservable<boolean>(setLoadingBar);

  const buildUrl = (data: Connection, type: keyof LoginError): string | undefined => {
    try {
      return urlReducer(data);
    } catch (error) {
      setLoginError({ ...loginError, [type]: true });
      NotificationService.debug({ title: i18n('build_url__fail'), message: JSON.stringify(error) });
    }
  };

  const syncOnSubscribe = (
    data: Connection,
    query: (u?: string, p?: string, b?: string) => Observable<unknown>,
    type: 'login_test' | 'login' | 'logout'
  ) => {
    const baseUrl = buildUrl(data, type === 'login_test' ? 'test' : 'login');
    if (!baseUrl) return;
    reset(data); // To reset dirty tag
    return query
      .bind(QueryService)(data?.username, data?.password, baseUrl)
      .pipe(
        before(() => {
          setLoginError({});
          setLoading(true);
          loadingBar$.next(true);
        }),
        finalize(() => {
          setLoading(false);
          setLoadingBar(false); // So there is no delay
          loadingBar$.next(false); // So that observable data is not stale
        })
      )
      .subscribe({
        complete: () => {
          if (type !== 'login_test') {
            QueryService.setBaseUrl(baseUrl);
            dispatch(data?.rememberMe ? syncConnection(data) : setConnection(data));
          }
          setLoginError({ ...loginError, [type]: false });
          NotificationService.info({ title: i18n(`${type}__success`), contextMessage: urlReducer(data), success: true });
        },
        error: (error: Error) => {
          setLoginError({ ...loginError, [type]: true });
          NotificationService.error({
            title: i18n(`${type}__fail`),
            message: error?.message ?? error?.name ?? '',
            contextMessage: urlReducer(data),
          });
        },
      });
  };

  const testLogin = (data: Connection) => syncOnSubscribe(data, QueryService.loginTest, 'login_test');

  const loginLogout = (data: Connection) => syncOnSubscribe(data, logged ? QueryService.logout : QueryService.login, logged ? 'logout' : 'login');

  const getColor = (type: keyof LoginError) => {
    if (loginError[type] === undefined || isDirty) return 'info';
    return loginError[type] ? 'error' : 'success';
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
                onChange: ({ target: { name, value } }) => isQuickConnect && setValue('protocol', Protocol.https),
              }}
            >
              {[ConnectionType.local, ConnectionType.twoFactor]?.map((type) => (
                <MenuItem key={type} value={type}>
                  {i18n(type, 'common', 'model', 'connection_type')}
                </MenuItem>
              ))}
            </FormInput>
          }
          sx={{ p: '0.5rem 0' }}
        />

        <Card
          component="form"
          sx={{ p: '0.5rem', m: '0.5rem 0', '& .MuiFormControl-root': { m: '0.5rem' } }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(loginLogout)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormInput
              controllerProps={{ name: 'protocol', control, rules: rules.protocol }}
              textFieldProps={{
                select: true,
                label: i18n('protocol'),
                sx: { flex: '1 0 6rem' },
                disabled: isQuickConnect,
              }}
            >
              {Object.values(Protocol)?.map((type) => (
                <MenuItem key={type} value={type}>
                  {i18n(type, 'common', 'model', 'protocol')}
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
              }}
            />

            {!isQuickConnect ? (
              <>
                <Typography id="path-port-dot" variant="body2" color="text.secondary">
                  :
                </Typography>

                <FormInput
                  controllerProps={{ name: 'port', control, rules: rules.port }}
                  textFieldProps={{
                    type: 'number',
                    label: i18n('port'),
                    sx: { flex: '1 0 6rem' },
                  }}
                />
              </>
            ) : (
              <Typography id="path-port-dot" variant="body2" color="text.secondary" sx={{ mr: '0.75rem' }}>
                .quickconnect.to
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex' }}>
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
          </Box>
        </Card>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
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
