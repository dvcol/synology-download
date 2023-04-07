import { Container } from '@mui/material';

import React, { lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import { SuspenseLoader } from '@src/components';
import { SettingHeader } from '@src/models';

import type { FC } from 'react';
import type { PathRouteProps } from 'react-router/lib/components';

const SettingsAdvanced = lazy(() => import(/* webpackChunkName: "SettingsAdvanced" */ './advanced/settings-advanced'));
const SettingsConnection = lazy(() => import(/* webpackChunkName: "SettingsConnection" */ './connection/settings-connection'));
const SettingsDownloads = lazy(() => import(/* webpackChunkName: "SettingsDownloads" */ './downloads/settings-downloads'));
const SettingsInterface = lazy(() => import(/* webpackChunkName: "SettingsInterface" */ './interface/settings-interface'));
const SettingsNotifications = lazy(() => import(/* webpackChunkName: "SettingsNotifications" */ './notifications/settings-notifications'));
const SettingsTasks = lazy(() => import(/* webpackChunkName: "SettingsTasks" */ './tasks/settings-tasks'));

export const SettingsRoutes: FC = () => {
  const routes: PathRouteProps[] = [
    { path: '/*', element: <SettingsConnection /> },
    { path: SettingHeader.downloads, element: <SettingsDownloads /> },
    { path: SettingHeader.tasks, element: <SettingsTasks /> },
    { path: SettingHeader.interface, element: <SettingsInterface /> },
    { path: SettingHeader.notification, element: <SettingsNotifications /> },
    { path: SettingHeader.advanced, element: <SettingsAdvanced /> },
  ];
  return (
    <Container sx={{ p: '0 1.5rem', overflow: 'auto', '& .MuiCard-root': { mb: '1rem' } }}>
      <Routes>
        {routes?.map(({ path, element }, index) => (
          <Route key={index} path={path} element={<SuspenseLoader element={element} />} />
        ))}
      </Routes>
    </Container>
  );
};
