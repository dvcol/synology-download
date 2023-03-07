import { Container, Paper, Tab, Tabs } from '@mui/material';

import React from 'react';

import { Route, Routes } from 'react-router-dom';

import { HashLink as Link } from 'react-router-hash-link';

import { useI18n } from '@dvcol/web-extension-utils';

import {
  SettingsBanner,
  SettingsContextMenus,
  SettingsCredentials,
  SettingsDownloads,
  SettingsHeader,
  SettingsPolling,
  SettingsQuickMenus,
  SettingsSnack,
  SettingsTasksCount,
} from '@src/components';
import { SettingsGlobal } from '@src/components/panel/settings/settings-global';
import { ConnectionHeader, InterfaceHeader, NotificationHeader, SettingHeader } from '@src/models';

import { SettingsTabs } from './settings-tabs';

export const Settings = () => {
  const i18n = useI18n('panel', 'settings');
  // Tab highlight
  const [tab, setTab] = React.useState<string>(SettingHeader.connection);
  const handleChange = (event: React.SyntheticEvent, newValue: SettingHeader) => setTab(newValue);

  const tabs: { label: SettingHeader; anchor?: string; links: string[] }[] = [
    { label: SettingHeader.connection, links: [ConnectionHeader.credential, ConnectionHeader.polling] },
    {
      label: SettingHeader.downloads,
      links: [InterfaceHeader.downloads],
    },
    {
      label: SettingHeader.interface,
      links: [InterfaceHeader.global, InterfaceHeader.tabs, InterfaceHeader.quickMenu, InterfaceHeader.contextMenu],
    },
    {
      label: SettingHeader.notification,
      links: [NotificationHeader.count, NotificationHeader.snack, NotificationHeader.banner],
    },
  ];

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 3rem)' }} maxWidth={false}>
      <Paper elevation={1} sx={{ overflow: 'auto' }}>
        <Tabs
          orientation="vertical"
          selectionFollowsFocus={true}
          value={tab}
          onChange={handleChange}
          sx={{
            flex: '1 1 auto',
            '& .MuiTab-root': {
              alignItems: 'flex-start',
              minWidth: '9rem',
            },
            overflow: 'auto',
          }}
        >
          {tabs.map(({ label, anchor, links }, i) => [
            <Tab
              label={i18n(label)}
              key={`${i}-${label}`}
              value={label}
              disableFocusRipple={true}
              component={Link}
              to={`${label}#${anchor ?? label}`}
              sx={{
                fontWeight: '700',
                fontSize: '0.75rem',
                backdropFilter: 'contrast(1.1)',
                whiteSpace: 'nowrap',
                minHeight: '3rem',
              }}
            />,
            ...(links?.map((l, j) => (
              <Tab
                label={i18n(`${label}_${l}`)}
                key={`${i}-${j}-${l}`}
                value={l}
                disableFocusRipple={true}
                component={Link}
                to={`${label}#${l}`}
                sx={{ backdropFilter: 'contrast(0.9)', whiteSpace: 'nowrap', minHeight: '2.78rem' }}
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
            path={SettingHeader.downloads}
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.downloads} />
                <SettingsDownloads />
              </React.Fragment>
            }
          />
          <Route
            path={SettingHeader.interface}
            element={
              <React.Fragment>
                <SettingsHeader label={SettingHeader.interface} />
                <SettingsGlobal />
                <SettingsTabs />
                <SettingsQuickMenus />
                <SettingsContextMenus />
                {/* TODO: settings for folder display */}
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
