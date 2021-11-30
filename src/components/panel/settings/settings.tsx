import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Fab,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { defaultMenu, defaultTabs, SettingHeader } from '../../../models';
import { addContextMenu, addTaskTab, getPassword, getSettings, getUrl, getUsername, removeContextMenu, removeTaskTab, resetTaskTab, syncSettings } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { v4 as uuid } from 'uuid';
import { synologyClient } from '../../../services';

export const Settings = () => {
  // form
  const dispatch = useDispatch();
  const [error, setError] = React.useState(false);

  const settings = useSelector(getSettings);
  const url = useSelector(getUrl);
  const username = useSelector(getUsername);
  const password = useSelector(getPassword);

  // TODO : migrate to react-hook-form & move this to login service
  const testLogin = () => {
    console.log(url, username, password);
    if (url && username && password) {
      synologyClient.setBaseUrl(url);
      synologyClient.login(username, password).subscribe({
        complete: () => {
          dispatch(syncSettings({ polling: { enabled: true } }));
          // TODO: Notification connection success
          console.info('Polling setting change success');
        },
        error: () => {
          dispatch(syncSettings({ polling: { enabled: false } }));
          console.error('Polling login failed');
        },
      });
    }
  };

  const testLogout = () => {
    console.log(url, username, password);
    synologyClient.logout().subscribe(() => {
      dispatch(syncSettings({ polling: { enabled: false } }));
      // TODO: Notificaiton logout success
      console.info('Polling setting change success');
    });
  };

  // Tab highlight
  const [header, setHeader] = React.useState(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setHeader(newValue);

  //TODO : Refactor sub card
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleExpand = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  //TODO : Refactor sub card
  const [expanded2, setExpanded2] = React.useState<string | false>(false);
  const handleExpand2 = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded2(isExpanded ? panel : false);
  };

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 65px)' }} maxWidth={false}>
      <Paper elevation={1}>
        <Tabs
          orientation="vertical"
          selectionFollowsFocus={true}
          value={header}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{
            flex: '1 1 auto',
            '& .MuiTab-root': { alignItems: 'flex-start' },
          }}
        >
          {Object.values(SettingHeader).map((t) => (
            <Tab label={t} value={t} disableFocusRipple={true} href={`#${t}`} key={t} />
          ))}
        </Tabs>
      </Paper>
      <Container
        sx={{
          padding: '1.5rem',
          overflow: 'auto',
          '& .MuiCard-root': { mb: '1rem' },
        }}
      >
        <Typography id={SettingHeader.connection} variant="h5" color="text.secondary" sx={{ mb: '1rem', textTransform: 'capitalize' }}>
          {SettingHeader.connection}
        </Typography>

        <Card raised={true}>
          <CardHeader
            title={
              <Typography variant="h6" color="text.primary">
                Credentials
              </Typography>
            }
            subheader={
              <Typography variant="caption" color="text.secondary" gutterBottom={true}>
                Two-factor authentication is not currently supported.
              </Typography>
            }
            sx={{ p: '1rem 1rem 0' }}
          ></CardHeader>
          <CardContent>
            <Box component="form" sx={{ '& .MuiFormControl-root': { m: '0.5rem' } }} noValidate autoComplete="off">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  id="protocol-select"
                  select
                  label="Protocol"
                  defaultValue="http"
                  value={settings?.connection.protocol}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch(
                      syncSettings({
                        connection: {
                          ...settings?.connection,
                          protocol: event.target.value,
                        },
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
                  value={settings?.connection.path}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch(
                      syncSettings({
                        connection: {
                          ...settings?.connection,
                          path: event.target.value,
                        },
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
                  value={settings?.connection.port}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch(
                      syncSettings({
                        connection: {
                          ...settings?.connection,
                          port: Number(event.target.value),
                        },
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
                  value={settings?.connection.username}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch(
                      syncSettings({
                        connection: {
                          ...settings?.connection,
                          username: event.target.value,
                        },
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
                  value={settings?.connection.password}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    dispatch(
                      syncSettings({
                        connection: {
                          ...settings?.connection,
                          password: event.target.value,
                        },
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

        <Typography id={SettingHeader.interface} variant="h5" color="text.secondary" sx={{ mb: '1rem', textTransform: 'capitalize' }}>
          {SettingHeader.interface}
        </Typography>

        <Card raised={true}>
          <CardHeader
            title={
              <Typography variant="h6" color="text.primary">
                Tabs
              </Typography>
            }
            sx={{ p: '1rem 1rem 0' }}
          ></CardHeader>
          <CardContent>
            {settings?.tabs?.map((t) => (
              <Accordion expanded={expanded2 === t.name} onChange={handleExpand2(t.name)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>{t.name}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{t.status}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Fab color="primary" aria-label="add" onClick={() => dispatch(removeTaskTab(t.id))}>
                    <AddIcon />
                  </Fab>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() =>
                dispatch(
                  addTaskTab({
                    ...defaultTabs[0],
                    name: String(Math.random()),
                    id: uuid(),
                  })
                )
              }
            >
              <AddIcon />
            </Fab>
            <Fab color="primary" aria-label="reset" onClick={() => dispatch(resetTaskTab())}>
              <SettingsBackupRestoreIcon />
            </Fab>
          </CardActions>
        </Card>

        <Card raised={true}>
          <CardHeader
            title={
              <Typography variant="h6" color="text.primary">
                Popup Modal
              </Typography>
            }
            sx={{ p: '1rem 1rem 0' }}
          ></CardHeader>
          <CardContent></CardContent>
        </Card>

        <Card raised={true}>
          <CardHeader
            title={
              <Typography variant="h6" color="text.primary">
                Context action
              </Typography>
            }
            sx={{ p: '1rem 1rem 0' }}
          ></CardHeader>
          <CardContent>
            {settings?.menus?.map((t) => (
              <Accordion expanded={expanded2 === t.id} onChange={handleExpand2(t.id)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>{t.id}</Typography>
                  <Typography sx={{ color: 'text.secondary' }}>{t.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Fab color="primary" aria-label="add" onClick={() => dispatch(removeContextMenu(t.id))}>
                    <AddIcon />
                  </Fab>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', padding: '0 1.5rem 1.5rem' }}>
            <Fab color="primary" aria-label="add" onClick={() => dispatch(addContextMenu({ ...defaultMenu, id: uuid() }))}>
              <AddIcon />
            </Fab>
          </CardActions>
        </Card>

        <Typography id={SettingHeader.notification} variant="h5" color="text.secondary" sx={{ mb: '1rem', textTransform: 'capitalize' }}>
          {SettingHeader.notification}
        </Typography>
      </Container>
    </Container>
  );
};

export default Settings;
