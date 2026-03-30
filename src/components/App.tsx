import type { EmotionCache } from '@emotion/cache';
import type { Theme } from '@mui/material';
import type { FC } from 'react';
import type { HashRouterProps } from 'react-router-dom';
import type { Store } from 'redux';

import type { AppInstance } from '../models/app-instance.model';
import type { StoreOrProxy } from '../models/store.model';

import { CacheProvider } from '@emotion/react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';

import { getThemeFromStore, subscribeToTheme } from '../themes/media-query';
import { darkTheme } from '../themes/themes';
import { ContainerContextProvider } from './common/context/container-content-provider';
import { NotificationStack } from './common/notification/notification-stack';
import { ExternalRouterProvider } from './common/router/external-router-provider';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';
import { SettingsInjector } from './panel/settings/settings-injector';

export interface AppProps { store: StoreOrProxy; cache?: EmotionCache; redirect?: string; routerProps?: HashRouterProps; instance: AppInstance }
export const App: FC<AppProps> = ({ store, redirect, cache, routerProps, instance }) => {
  const [theme, setTheme] = useState<Theme>(() => getThemeFromStore(store));
  const isDark = theme === darkTheme;

  const background = {
    '--syn-color': isDark ? '#bdbdbd' : '#1f2020',
    '--syn-bg-color': isDark ? '#20262D' : '#eaeef2',
    'color': 'var(--syn-color)',
    'backgroundColor': 'var(--syn-bg-color)',
  };

  const containerRef = useRef<Element>(null);

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run on mount, this is a subscription
  }, []);

  let Main = (
    <ThemeProvider theme={theme}>
      <Box id="synology-download-app-container" sx={{ ...background, height: '100%', scrollBehavior: 'smooth' }} ref={containerRef}>
        <ContainerContextProvider containerRef={containerRef} instance={instance}>
          <NotificationStack maxSnack={2} />
          <SettingsInjector />
          <Router {...routerProps}>
            <CssBaseline />
            <Navbar />
            <Panel redirect={redirect} />
            <ExternalRouterProvider />
          </Router>
        </ContainerContextProvider>
      </Box>
    </ThemeProvider>
  );

  if (cache) Main = <CacheProvider value={cache}>{Main}</CacheProvider>;

  return (
    <StrictMode>
      <Provider store={store as Store}>{Main}</Provider>
    </StrictMode>
  );
};
