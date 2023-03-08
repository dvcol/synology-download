import { Container } from '@mui/material';

import React from 'react';

import { Route, Routes } from 'react-router-dom';

import { SettingsChromeStorage, SettingsLogging, SettingsRedux } from '@src/components/panel/settings/advanced';
import { SettingHeader } from '@src/models';

import { SettingsCredentials, SettingsPolling } from './connection';

import { SettingsDownloads, SettingsDownloadsHistory, SettingsDownloadsIntercept } from './downloads';
import { SettingsContextMenus, SettingsGlobal, SettingsQuickMenus, SettingsTabs } from './interface';
import { SettingsBanner, SettingsSnack, SettingsTasksCount } from './notifications';

import { SettingsHeader } from './settings-header';

import type { FC } from 'react';
import type { PathRouteProps } from 'react-router/lib/components';

export const SettingsRoutes: FC = () => {
  const routes: PathRouteProps[] = [
    {
      path: '/*',
      element: (
        <React.Fragment>
          <SettingsHeader label={SettingHeader.connection} />
          <SettingsCredentials />
          <SettingsPolling />
        </React.Fragment>
      ),
    },
    {
      path: SettingHeader.downloads,
      element: (
        <React.Fragment>
          <SettingsHeader label={SettingHeader.downloads} />
          <SettingsDownloads />
          <SettingsDownloadsIntercept />
          <SettingsDownloadsHistory />
        </React.Fragment>
      ),
    },
    {
      path: SettingHeader.interface,
      element: (
        <React.Fragment>
          <SettingsHeader label={SettingHeader.interface} />
          <SettingsGlobal />
          <SettingsTabs />
          <SettingsQuickMenus />
          <SettingsContextMenus />
        </React.Fragment>
      ),
    },
    {
      path: SettingHeader.notification,
      element: (
        <React.Fragment>
          <SettingsHeader label={SettingHeader.notification} />
          <SettingsTasksCount />
          <SettingsSnack />
          <SettingsBanner />
        </React.Fragment>
      ),
    },
    {
      path: SettingHeader.advanced,
      element: (
        <React.Fragment>
          <SettingsHeader label={SettingHeader.advanced} />
          <SettingsLogging />
          <SettingsRedux />
          <SettingsChromeStorage />
        </React.Fragment>
      ),
    },
  ];
  return (
    <Container sx={{ p: '0 1.5rem', overflow: 'auto', '& .MuiCard-root': { mb: '1rem' } }}>
      <Routes>
        {routes?.map((route, i) => (
          <Route key={i} {...route} />
        ))}
      </Routes>
    </Container>
  );
};
