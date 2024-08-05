import { CacheProvider } from '@emotion/react';

import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';

import { HashRouter as Router } from 'react-router-dom';

import { ContainerContextProvider, ExternalRouterProvider, SettingsInjector } from '@src/components';
import type { AppInstance, StoreOrProxy } from '@src/models';
import { darkTheme, getThemeFromStore, subscribeToTheme } from '@src/themes';

import { NotificationStack } from './common';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';

import type { EmotionCache } from '@emotion/utils';
import type { Theme } from '@mui/material';
import type { FC } from 'react';
import type { HashRouterProps } from 'react-router-dom';

export type AppProps = { store: StoreOrProxy; cache?: EmotionCache; redirect?: string; routerProps?: HashRouterProps; instance: AppInstance };
export const App: FC<AppProps> = ({ store, redirect, cache, routerProps, instance }) => {
  const [theme, setTheme] = useState<Theme>(getThemeFromStore(store));
  const isDark = theme === darkTheme;

  const background = isDark ? { color: '#bdbdbd', backgroundColor: '#20262D' } : { color: '#1f2020', backgroundColor: '#eaeef2' };

  const containerRef = useRef<Element>(null);

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
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
    <React.StrictMode>
      <Provider store={store}>{Main}</Provider>
    </React.StrictMode>
  );
};
