import React from 'react';
import { Container, Paper, Tab, Tabs } from '@mui/material';
import { ConnectionHeader, InterfaceHeader, SettingHeader } from '../../../models';
import { SettingsCredentials } from './settings-credentials';
import { SettingsTabs } from './settings-tabs';
import { SettingsContext } from './settings-context';
import { SettingsModal } from './settings-modals';
import { SettingsNotifications } from './settings-notifications';
import { SettingsPolling } from './settings-polling';
import { SettingsHeader } from './settings-header';
import { SettingsTasksCount } from './settings-tasks-count';

export const Settings = () => {
  // Tab highlight
  const [tab, setTab] = React.useState<string>(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setTab(newValue);
  const handleActive = (label: string, inView: boolean) => inView && setTab(label);

  const tabs = [
    { label: SettingHeader.connection, links: [ConnectionHeader.credential, ConnectionHeader.polling] },
    { label: SettingHeader.interface, links: [InterfaceHeader.tabs, InterfaceHeader.modals, InterfaceHeader.context] },
    { label: SettingHeader.notification },
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
              href={`#${label}`}
              sx={{ fontWeight: '700', fontSize: '0.75rem', backdropFilter: 'contrast(1.1)' }}
            />,
            ...(links?.map((link, j) => (
              <Tab
                label={link}
                key={`${i}-${j}-${link}`}
                value={link}
                disableFocusRipple={true}
                href={`#${link}`}
                sx={{ backdropFilter: 'contrast(0.9)' }}
              />
            )) ?? []),
          ])}
        </Tabs>
      </Paper>
      <Container sx={{ p: '0 1.5rem', overflow: 'auto', '& .MuiCard-root': { mb: '1rem' } }}>
        <SettingsHeader label={SettingHeader.connection} onChange={handleActive} />

        <SettingsCredentials />
        <SettingsPolling />

        <SettingsHeader label={SettingHeader.interface} onChange={handleActive} />

        <SettingsTabs />
        <SettingsModal />
        <SettingsContext />

        <SettingsHeader label={SettingHeader.notification} onChange={handleActive} />

        <SettingsTasksCount />
        <SettingsNotifications />
      </Container>
    </Container>
  );
};

export default Settings;
