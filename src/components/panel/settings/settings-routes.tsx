import { Container } from '@mui/material';

import React, { lazy, useContext } from 'react';

import { Route, Routes } from 'react-router-dom';

import { SuspenseLoader } from '@src/components';
import { AppInstance, SettingHeader } from '@src/models';
import { ContainerContext } from '@src/store';
import { useAnchor } from '@src/utils';

import type { FC } from 'react';
import type { PathRouteProps } from 'react-router/lib/components';

const SettingsAdvanced = lazy(() => import(/* webpackChunkName: "SettingsAdvanced" */ './advanced/settings-advanced'));
const SettingsConnection = lazy(() => import(/* webpackChunkName: "SettingsConnection" */ './connection/settings-connection'));
const SettingsDownloads = lazy(() => import(/* webpackChunkName: "SettingsDownloads" */ './downloads/settings-downloads'));
const SettingsInterface = lazy(() => import(/* webpackChunkName: "SettingsInterface" */ './interface/settings-interface'));
const SettingsNotifications = lazy(() => import(/* webpackChunkName: "SettingsNotifications" */ './notifications/settings-notifications'));
const SettingsTasks = lazy(() => import(/* webpackChunkName: "SettingsTasks" */ './tasks/settings-tasks'));

export const SettingsRoutes: FC = () => {
  const context = useContext(ContainerContext);
  // added to support shadow dom anchor routing, offset is for navbar
  if (context.instance === AppInstance.standalone) {
    // eslint-disable-next-line react-hooks/rules-of-hooks -- only inject hooks if in WC (render are consistent)
    useAnchor('settings-scroll-container', -60);
  }
  const routes: PathRouteProps[] = [
    { path: '/*', element: <SettingsConnection /> },
    { path: SettingHeader.downloads, element: <SettingsDownloads /> },
    { path: SettingHeader.tasks, element: <SettingsTasks /> },
    { path: SettingHeader.interface, element: <SettingsInterface /> },
    { path: SettingHeader.notification, element: <SettingsNotifications /> },
    { path: SettingHeader.advanced, element: <SettingsAdvanced /> },
  ];
  return (
    <Container
      id="settings-scroll-container"
      sx={{ p: '0 1.5rem', overflow: 'auto', overscrollBehaviorY: 'contain', '& .MuiCard-root': { mb: '1rem' } }}
    >
      <Routes>
        {routes?.map(({ path, element }, index) => (
          <Route key={index} path={path} element={<SuspenseLoader element={element} />} />
        ))}
      </Routes>
    </Container>
  );
};
