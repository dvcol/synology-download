import { Box, Button, Card, CardActions, CardContent, CardHeader, MenuItem, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { getConnection, syncConnection } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { QueryService } from '../../../services';

export const SettingsCredentials = () => {
  const dispatch = useDispatch();
  const connection = useSelector(getConnection);
  const [error, setError] = React.useState(false);

  // TODO : migrate to react-hook-form & move this to login service
  const testLogin = () => {
    console.log('login in');
    QueryService.login().subscribe();
  };

  const testLogout = () => {
    console.log('login out');
    QueryService.logout().subscribe();
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
        <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              id="protocol-select"
              select
              label="Protocol"
              defaultValue="http"
              value={connection?.protocol}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(
                  syncConnection({
                    protocol: event.target.value,
                  })
                )
              }
              sx={{ flex: '1 0 6rem' }}
              error={error}
            >
              <MenuItem key="http" value="http">
                http
              </MenuItem>
              <MenuItem key="https" value="https">
                https
              </MenuItem>
            </TextField>
            <Typography id="protocol-path-slash" variant="body2" color="text.secondary">
              ://
            </Typography>
            <TextField
              id="host-input"
              label="Path"
              type="text"
              value={connection?.path}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(
                  syncConnection({
                    path: event.target.value,
                  })
                )
              }
              sx={{ flex: '1 1 auto' }}
              error={error}
            />
            <Typography id="path-port-dot" variant="body2" color="text.secondary">
              :
            </Typography>
            <TextField
              id="port-input"
              label="Port"
              type="number"
              value={connection?.port}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(
                  syncConnection({
                    port: Number(event.target.value),
                  })
                )
              }
              sx={{ flex: '1 0 6rem' }}
              error={error}
            />
          </Box>
          <Box sx={{ display: 'flex' }}>
            <TextField
              id="username-input"
              label="Username"
              value={connection?.username}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(
                  syncConnection({
                    username: event.target.value,
                  })
                )
              }
              type="text"
              sx={{ flex: '1 1 auto' }}
              error={error}
            />
            <TextField
              id="password-input"
              label="Password"
              value={connection?.password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(
                  syncConnection({
                    password: event.target.value,
                  })
                )
              }
              type="password"
              sx={{ flex: '1 1 auto' }}
              error={error}
            />
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={testLogin}>
            Login
          </Button>
          <Button variant="outlined" onClick={testLogout}>
            Logout
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
};
