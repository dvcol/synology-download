import type { FC } from 'react';
import type { PathRouteProps } from 'react-router-dom';

import { Container } from '@mui/material';
import * as React from 'react';
import { lazy, use } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppInstance } from '../../../models/app-instance.model';
import { SettingHeader } from '../../../models/settings.model';
import { ContainerContext } from '../../../store/context/container.context';
import { useAnchor } from '../../../utils/hooks.utils';
import { SuspenseLoader } from '../../common/loader/suspense-loader';

const SettingsAdvanced = lazy(async () => import(/* webpackChunkName: "SettingsAdvanced" */ './advanced/settings-advanced'));
const SettingsConnection = lazy(async () => import(/* webpackChunkName: "SettingsConnection" */ './connection/settings-connection'));
const SettingsDownloads = lazy(async () => import(/* webpackChunkName: "SettingsDownloads" */ './downloads/settings-downloads'));
const SettingsInterface = lazy(async () => import(/* webpackChunkName: "SettingsInterface" */ './interface/settings-interface'));
const SettingsNotifications = lazy(async () => import(/* webpackChunkName: "SettingsNotifications" */ './notifications/settings-notifications'));
const SettingsTasks = lazy(async () => import(/* webpackChunkName: "SettingsTasks" */ './tasks/settings-tasks'));

export const SettingsRoutes: FC = () => {
  const context = use(ContainerContext);
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
      sx={{ 'p': '0 1.5rem', 'overflow': 'auto', 'overscrollBehaviorY': 'contain', '& .MuiCard-root': { mb: '1rem' } }}
    >
      <Routes>
        {routes?.map(({ path, element }) => (
          <Route key={path} path={path} element={<SuspenseLoader element={element} />} />
        ))}
      </Routes>
    </Container>
  );
};
