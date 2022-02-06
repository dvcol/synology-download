import React from 'react';
import { Container, Paper, Tab, Tabs } from '@mui/material';
import { ConnectionHeader, InterfaceHeader, NotificationHeader, SettingHeader } from '@src/models';
import {
  SettingsBanner,
  SettingsContextMenus,
  SettingsCredentials,
  SettingsHeader,
  SettingsPolling,
  SettingsQuickMenus,
  SettingsSnack,
  SettingsTasksCount,
} from '@src/components';
import { Route, Routes } from 'react-router-dom';
import { HashLink as Link } from 'react-router-hash-link';
import { SettingsTabs } from './settings-tabs';
import { useI18n } from '@src/utils';

export const Settings = () => {
  const i18n = useI18n('panel', 'settings');
  // Tab highlight
  const [tab, setTab] = React.useState<string>(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setTab(newValue);

  const tabs = [
    { label: SettingHeader.connection, links: [ConnectionHeader.credential, ConnectionHeader.polling] },
    { label: SettingHeader.interface, links: [InterfaceHeader.tabs, InterfaceHeader.quickMenu, InterfaceHeader.contextMenu] },
    { label: SettingHeader.notification, links: [NotificationHeader.count, NotificationHeader.snack, NotificationHeader.banner] },
  ];

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 48px)' }} maxWidth={false}>
      <Paper elevation={1}>
        <Tabs
          orientation="vertical"
          selectionFollowsFocus={true}
          value={tab}
          onChange={handleChange}
          sx={{
            flex: '1 1 auto',
            '& .MuiTab-root': { alignItems: 'flex-start' },
          }}
        >
          {tabs.map(({ label, links }, i) => [
            <Tab
              label={i18n(label)}
              key={`${i}-${label}`}
              value={label}
              disableFocusRipple={true}
              component={Link}
              to={`${label}#${label}`}
              sx={{ fontWeight: '700', fontSize: '0.75rem', backdropFilter: 'contrast(1.1)', whiteSpace: 'nowrap' }}
            />,
            ...(links?.map((l, j) => (
              <Tab
                label={i18n(`${label}_${l}`)}
                key={`${i}-${j}-${l}`}
                value={l}
                disableFocusRipple={true}
                component={Link}
                to={`${label}#${l}`}
                sx={{ backdropFilter: 'contrast(0.9)', whiteSpace: 'nowrap' }}
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
                <SettingsQuickMenus />
                <SettingsContextMenus />
                {/* TODO: settings for folder display */}
                {/*  TODO : settings clear/delete by tabs or global */}
                {/* TODO: Toggle for dark theme / light theme / follow OS */}
              </React.Fragment>
            }
          />
          <Route
            path={SettingHeader.notification}
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.notification} />
                <SettingsTasksCount />
                <SettingsSnack />
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
