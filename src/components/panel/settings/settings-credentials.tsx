import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { getConnection, getLogged, setConnection, syncConnection, urlReducer } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { QueryService } from '../../../services';
import { Controller, RegisterOptions, useForm } from 'react-hook-form';
import { Connection } from '../../../models';
import { Observable } from 'rxjs';

// TODO : error on logout break UI
export const SettingsCredentials = () => {
  const dispatch = useDispatch();
  const connection = useSelector(getConnection);
  const logged = useSelector(getLogged);

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm<Connection>({ mode: 'onChange', defaultValues: { protocol: '', path: '', username: '', password: '', ...connection } });

  const rules: Record<keyof Omit<Connection, 'logged' | 'rememberMe'>, RegisterOptions> = {
    protocol: { required: true },
    path: { required: true },
    port: { required: true, min: 1025, max: 65535 },
    username: { required: true },
    password: { required: true },
  };

  const [loginError, setLoginError] = useState<boolean>();

  const onSubmit = (data: any, error: any) => console.log(data, error);

  const syncOnSubscribe = (data: Connection, query: Observable<any>) =>
    query.subscribe({
      complete: () => {
        dispatch(data?.rememberMe ? syncConnection(data) : setConnection(data));
        setLoginError(false);
      },
      error: () => {
        setLoginError(true);
        QueryService.setBaseUrl(urlReducer(connection));
      },
    });

  // Todo request indicator ?
  const testLogin = (data: Connection) => {
    console.log('test login');
    QueryService.setBaseUrl(urlReducer(data));
    syncOnSubscribe(data, QueryService.loginTest());
  };

  const loginLogout = (data: Connection) => {
    console.log(logged ? 'login out' : 'login in');
    QueryService.setBaseUrl(urlReducer(data));
    syncOnSubscribe(data, logged ? QueryService.logout() : QueryService.login());
  };

  return (
    <Card raised={true}>
      <CardHeader
        title={'Credentials'}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        subheader={'Two-factor authentication is not currently supported.'}
        subheaderTypographyProps={{ variant: 'caption', color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Controller
              name="protocol"
              control={control}
              rules={rules.protocol}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  id="protocol-select"
                  select
                  label="Protocol"
                  error={invalid}
                  helperText={error?.message}
                  sx={{ flex: '1 0 6rem' }}
                  {...field}
                >
                  <MenuItem key="http" value="http">
                    http
                  </MenuItem>
                  <MenuItem key="https" value="https">
                    https
                  </MenuItem>
                </TextField>
              )}
            />
            <Typography id="protocol-path-slash" variant="body2" color="text.secondary">
              ://
            </Typography>
            <Controller
              name="path"
              control={control}
              rules={rules.path}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  id="host-input"
                  label="Path"
                  type="text"
                  error={invalid}
                  helperText={error?.message}
                  {...field}
                  sx={{ flex: '1 1 auto' }}
                />
              )}
            />
            <Typography id="path-port-dot" variant="body2" color="text.secondary">
              :
            </Typography>

            <Controller
              name="port"
              control={control}
              rules={rules.port}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  id="port-input"
                  label="Port"
                  type="number"
                  error={invalid}
                  helperText={error?.message}
                  {...field}
                  sx={{ flex: '1 0 6rem' }}
                />
              )}
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <Controller
              name="username"
              control={control}
              rules={rules.username}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  id="username-input"
                  label="Username"
                  {...field}
                  type="text"
                  error={invalid}
                  helperText={error?.message}
                  sx={{ flex: '1 1 auto' }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={rules.password}
              render={({ field, fieldState: { invalid, error } }) => (
                <TextField
                  id="password-input"
                  label="Password"
                  {...field}
                  type="password"
                  error={invalid}
                  helperText={error?.message}
                  sx={{ flex: '1 1 auto' }}
                />
              )}
            />
          </Box>
        </Box>
      </CardContent>

      {loginError !== undefined && (
        // TODO: rethink message, transition ? card background ?
        <CardContent>
          <FormHelperText id="login-error-text" error={loginError}>
            {loginError ? 'Login attempt failed' : 'Logged in successfully'}
          </FormHelperText>
        </CardContent>
      )}

      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
              label="Remember me"
            />
          )}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" type="submit" disabled={!isValid} onClick={handleSubmit(testLogin)}>
            Test Login
          </Button>
          <Button variant="outlined" type="submit" disabled={!isValid} onClick={handleSubmit(loginLogout)}>
            {logged ? 'Logout' : 'Login'}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
