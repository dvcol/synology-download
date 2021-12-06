import React from 'react';
import { Container, Paper, Tab, Tabs, Typography } from '@mui/material';
import { SettingHeader } from '../../../models';
import { SettingsCredentials } from './settings-credentials';
import { SettingsTabs } from './settings-tabs';
import { SettingsContext } from './settings-context';
import { SettingsModal } from './settings-modals';
import { SettingsNotifications } from './settings-notifications';
import { SettingsPolling } from './settings-polling';

export const Settings = () => {
  // Tab highlight
  const [header, setHeader] = React.useState(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setHeader(newValue);

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 48px)' }} maxWidth={false}>
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
          {Object.values(SettingHeader).map((t, i) => (
            <Tab label={t} key={`${i}-${t}`} value={t} disableFocusRipple={true} href={`#${t}`} />
          ))}
        </Tabs>
      </Paper>
      <Container sx={{ p: '0 1.5rem', overflow: 'auto', '& .MuiCard-root': { mb: '1rem' } }}>
        <Typography id={SettingHeader.connection} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
          {SettingHeader.connection}
        </Typography>

        <SettingsCredentials />
        <SettingsPolling />

        <Typography id={SettingHeader.interface} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
          {SettingHeader.interface}
        </Typography>

        <SettingsTabs />
        <SettingsModal />
        <SettingsContext />

        <Typography id={SettingHeader.notification} variant="h5" color="text.secondary" sx={{ p: '1rem 0', textTransform: 'capitalize' }}>
          {SettingHeader.notification}
        </Typography>

        <SettingsNotifications />
      </Container>
    </Container>
  );
};

export default Settings;
