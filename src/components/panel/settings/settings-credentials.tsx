import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { getConnection, getLogged, setConnection, syncConnection, urlReducer } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { QueryService } from '../../../services';
import { RegisterOptions, useForm } from 'react-hook-form';
import { Connection, ConnectionHeader } from '../../../models';
import { finalize, Observable } from 'rxjs';
import { FormSwitch } from '../../form/form-switch';
import { FormInput } from '../../form/form-input';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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
  const [showPassword, setShowPassword] = useState<boolean>();

  const syncOnSubscribe = (data: Connection, query: Observable<any>, type: keyof LoginError = 'login') => {
    reset(data);
    setLoginError({});
    const timeout = setTimeout(() => setLoading(true), 500);
    return query
      .pipe(
        finalize(() => {
          clearTimeout(timeout);
          setLoading(false);
        })
      )
      .subscribe({
        complete: () => {
          dispatch(data?.rememberMe ? syncConnection(data) : setConnection(data));
          setLoginError({ ...loginError, [type]: false });
        },
        error: () => {
          setLoginError({ ...loginError, [type]: true });
          QueryService.setBaseUrl(urlReducer(connection));
        },
      });
  };

  const testLogin = (data: Connection) => {
    QueryService.setBaseUrl(urlReducer(data));
    syncOnSubscribe(data, QueryService.loginTest(data?.username, data?.password), 'test');
  };

  const loginLogout = (data: Connection) => {
    QueryService.setBaseUrl(urlReducer(data));
    syncOnSubscribe(data, logged ? QueryService.logout() : QueryService.login(data?.username, data?.password));
  };

  const getColor = (type: keyof LoginError) => (loginError[type] === undefined || isDirty ? 'info' : loginError[type] ? 'error' : 'success');

  const title = ConnectionHeader.credential;
  return (
    <Card raised={true}>
      {loading && <LinearProgress />}
      <CardHeader
        id={title}
        title={title}
        titleTypographyProps={{ variant: 'h6', color: 'text.primary' }}
        subheader={'Two-factor authentication is not currently supported.'}
        subheaderTypographyProps={{ variant: 'caption', color: 'text.secondary', gutterBottom: true }}
        sx={{ p: '1rem 1rem 0', textTransform: 'capitalize' }}
      />
      <CardContent>
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
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
                type: showPassword ? 'text' : 'password',
                label: 'Password',
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', padding: '0 1.5rem 1.5rem' }}>
        <FormSwitch controllerProps={{ name: 'rememberMe', control }} formControlLabelProps={{ label: 'Remember me' }} />
        <Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color={getColor('test')} type="submit" disabled={!isValid} onClick={handleSubmit(testLogin)}>
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
