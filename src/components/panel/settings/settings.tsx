import React from 'react';
import { Container, Paper, Tab, Tabs } from '@mui/material';
import { ConnectionHeader, InterfaceHeader, NotificationHeader, SettingHeader } from '../../../models';
import { SettingsCredentials } from './settings-credentials';
import { Route, Routes } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { SettingsHeader } from './settings-header';
import { SettingsPolling } from './settings-polling';
import { SettingsTabs } from './settings-tabs';
import { SettingsModal } from './settings-modals';
import { SettingsContext } from './settings-context';
import { SettingsTasksCount } from './settings-tasks-count';
import { SettingsBanner } from './settings-banner';

export const Settings = () => {
  // Tab highlight
  const [tab, setTab] = React.useState<string>(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setTab(newValue);

  const tabs = [
    { label: SettingHeader.connection, links: [ConnectionHeader.credential, ConnectionHeader.polling] },
    { label: SettingHeader.interface, links: [InterfaceHeader.tabs, InterfaceHeader.modals, InterfaceHeader.context] },
    { label: SettingHeader.notification, links: [NotificationHeader.count, NotificationHeader.banner] },
  ];

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 48px)' }} maxWidth={false}>
      <Paper elevation={1}>
        <Tabs
          orientation="vertical"
          selectionFollowsFocus={true}
          value={tab}
          onChange={handleChange}
          aria-label="Vertical tabs example"
          sx={{
            flex: '1 1 auto',
            '& .MuiTab-root': { alignItems: 'flex-start' },
          }}
        >
          {tabs.map(({ label, links }, i) => [
            <Tab
              label={label}
              key={`${i}-${label}`}
              value={label}
              disableFocusRipple={true}
              component={Link}
              to={`${label}#${label}`}
              sx={{ fontWeight: '700', fontSize: '0.75rem', backdropFilter: 'contrast(1.1)' }}
            />,
            ...(links?.map((l, j) => (
              <Tab
                label={l}
                key={`${i}-${j}-${l}`}
                value={l}
                disableFocusRipple={true}
                component={Link}
                to={`${label}#${l}`}
                sx={{ backdropFilter: 'contrast(0.9)' }}
              />
            )) ?? []),
          ])}
        </Tabs>
      </Paper>
      <Container sx={{ p: '0 1.5rem', overflow: 'auto', '& .MuiCard-root': { mb: '1rem' } }}>
        <Routes>
          <Route
            path="/*"
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.connection} />
                <SettingsCredentials />
                <SettingsPolling />
              </React.Fragment>
            }
          />
          <Route
            path={SettingHeader.interface}
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.interface} />
                <SettingsTabs />
                <SettingsModal />
                <SettingsContext />
              </React.Fragment>
            }
          />
          <Route
            path={SettingHeader.notification}
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.notification} />
                <SettingsTasksCount />
                <SettingsBanner />
              </React.Fragment>
            }
          />
        </Routes>
      </Container>
    </Container>
  );
};

export default Settings;
