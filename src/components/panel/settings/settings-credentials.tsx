import { Box, Button, Card, CardActions, CardContent, CardHeader, LinearProgress, MenuItem, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { getConnection, getLogged, setConnection, syncConnection, syncRememberMe, urlReducer } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { NotificationService, QueryService } from '../../../services';
import { RegisterOptions, useForm } from 'react-hook-form';
import { Connection, ConnectionHeader } from '../../../models';
import { finalize, Observable } from 'rxjs';
import { FormCheckbox, FormInput } from '../../form';
import { SwitchBaseProps } from '@mui/material/internal/SwitchBase';

// TODO : 2FA & HTTPS
export const SettingsCredentials = () => {
  const dispatch = useDispatch();
  const connection = useSelector(getConnection);
  const logged = useSelector(getLogged);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isValid, isDirty },
  } = useForm<Connection>({ mode: 'onChange', defaultValues: { protocol: '', path: '', username: '', password: '', ...connection } });

  const rules: Record<keyof Omit<Connection, 'logged' | 'rememberMe'>, RegisterOptions> = {
    protocol: { required: true },
    path: { required: true },
    port: { required: true, min: 1025, max: 65535 },
    username: { required: true },
    password: { required: true },
  };

  type LoginError = { test?: boolean; login?: boolean };
  const [loginError, setLoginError] = useState<LoginError>({});
  const [loading, setLoading] = useState<boolean>();

  const setUrl = (data: Connection, type: keyof LoginError) => {
    try {
      QueryService.setBaseUrl(urlReducer(data));
    } catch (error) {
      setLoginError({ ...loginError, [type]: true });
      console.debug('Failed to set url', error);
      NotificationService.debug('Failed to set url', JSON.stringify(error));
    }
  };

  const syncOnSubscribe = (data: Connection, query: (u?: string, p?: string) => Observable<unknown>, type: 'test' | 'login' | 'logout') => {
    setUrl(data, type === 'test' ? 'test' : 'login');
    reset(data);
    setLoginError({});
    const timeout = setTimeout(() => setLoading(true), 500);
    return query
      .bind(QueryService)(data?.username, data?.password)
      .pipe(
        finalize(() => {
          clearTimeout(timeout);
          setLoading(false);
        })
      )
      .subscribe({
        complete: () => {
          // Todo logout, rework test
          if (type === 'test') {
            QueryService.setBaseUrl(urlReducer(connection));
          } else {
            dispatch(data?.rememberMe ? syncConnection(data) : setConnection(data));
          }
          setLoginError({ ...loginError, [type]: false });
          NotificationService.info('Login/Logout', `The ${type} was successful`, urlReducer(data));
        },
        error: (error: Error) => {
          setLoginError({ ...loginError, [type]: true });
          QueryService.setBaseUrl(urlReducer(connection));
          NotificationService.error(`The ${type} has failed`, error?.message ?? error?.name, urlReducer(data));
        },
      });
  };

  const testLogin = (data: Connection) => syncOnSubscribe(data, QueryService.loginTest, 'test');

  const loginLogout = (data: Connection) => syncOnSubscribe(data, logged ? QueryService.logout : QueryService.login, logged ? 'logout' : 'login');

  const getColor = (type: keyof LoginError) => {
    if (loginError[type] === undefined || isDirty) return 'info';
    return loginError[type] ? 'error' : 'success';
  };

  const onRememberMeChange: SwitchBaseProps['onChange'] = (_, rememberMe) => dispatch(syncRememberMe(rememberMe));

  const title = ConnectionHeader.credential;
  return (
    <Card raised={true}>
      {loading && <LinearProgress />}
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        subheader={'Two-factor authentication is not currently supported.'}
        subheaderTypographyProps={{ color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off" onSubmit={handleSubmit(loginLogout)}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FormInput
              controllerProps={{ name: 'protocol', control, rules: rules.protocol }}
              textFieldProps={{
                select: true,
                label: 'Protocol',
                sx: { flex: '1 0 6rem' },
              }}
            >
              <MenuItem key="http" value="http">
                http
              </MenuItem>
              <MenuItem key="https" value="https">
                https
              </MenuItem>
            </FormInput>

            <Typography id="protocol-path-slash" variant="body2" color="text.secondary">
              ://
            </Typography>

            <FormInput
              controllerProps={{ name: 'path', control, rules: rules.path }}
              textFieldProps={{
                type: 'text',
                label: 'Path',
              }}
            />

            <Typography id="path-port-dot" variant="body2" color="text.secondary">
              :
            </Typography>

            <FormInput
              controllerProps={{ name: 'port', control, rules: rules.port }}
              textFieldProps={{
                type: 'number',
                label: 'Port',
                sx: { flex: '1 0 6rem' },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <FormInput
              controllerProps={{ name: 'username', control, rules: rules.username }}
              textFieldProps={{
                type: 'text',
                label: 'Username',
              }}
            />

            <FormInput
              controllerProps={{ name: 'password', control, rules: rules.password }}
              textFieldProps={{
                type: 'password',
                label: 'Password',
              }}
            />
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
        <FormCheckbox
          controllerProps={{ name: 'rememberMe', control }}
          checkboxProps={{ onChange: onRememberMeChange }}
          formControlLabelProps={{ label: 'Remember me' }}
        />
        <Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color={getColor('test')} disabled={!isValid} onClick={handleSubmit(testLogin)}>
              Test Login
            </Button>
            <Button
              variant="outlined"
              color={getColor('login')}
              sx={{ width: '5rem' }}
              type="submit"
              disabled={!isValid}
              onClick={handleSubmit(loginLogout)}
            >
              {logged ? 'Logout' : 'Login'}
            </Button>
          </Stack>
        </Box>
      </CardActions>
    </Card>
  );
};
