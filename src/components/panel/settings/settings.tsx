import { Container } from '@mui/material';

import React from 'react';

import type { SettingsPanelTab } from '@src/models';
import { AdvancedHeader, ConnectionHeader, DownloadsHeader, InterfaceHeader, NotificationHeader, SettingHeader, TasksHeader } from '@src/models';

import { SettingsNavbar } from './settings-navbar';
import { SettingsRoutes } from './settings-routes';

export const Settings = () => {
  const tabs: SettingsPanelTab[] = [
    { label: SettingHeader.connection, links: [ConnectionHeader.credential, ConnectionHeader.polling] },
    {
      label: SettingHeader.tasks,
      links: [TasksHeader.form],
    },
    {
      label: SettingHeader.downloads,
      links: [DownloadsHeader.general, DownloadsHeader.intercept, DownloadsHeader.history],
    },
    {
      label: SettingHeader.interface,
      links: [InterfaceHeader.global, InterfaceHeader.tabs, InterfaceHeader.quickMenu, InterfaceHeader.contextMenu],
    },
    {
      label: SettingHeader.notification,
      links: [NotificationHeader.count, NotificationHeader.snack, NotificationHeader.banner],
    },
    {
      label: SettingHeader.advanced,
      links: [AdvancedHeader.logging, AdvancedHeader.redux, AdvancedHeader.storage],
    },
  ];

  return (
    <Container disableGutters sx={{ display: 'flex', flex: '1 1 auto', height: 'calc(100vh - 3rem)' }} maxWidth={false}>
      <SettingsNavbar tabs={tabs} />
      <SettingsRoutes />
    </Container>
  );
};

export default Settings;
