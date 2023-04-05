import { CacheProvider } from '@emotion/react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';

import { HashRouter as Router } from 'react-router-dom';

import { SettingsInjector } from '@src/components/panel';
import type { StoreOrProxy } from '@src/models';
import { ContainerService } from '@src/services';
import { darkTheme, getThemeFromStore, subscribeToTheme } from '@src/themes';

import { NotificationStack } from './common';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';

import type { EmotionCache } from '@emotion/utils';

import type { Theme } from '@mui/material/styles/createTheme';
import type { FC } from 'react';
import type { HashRouterProps } from 'react-router-dom';

export type AppProps = { store: StoreOrProxy; cache?: EmotionCache; redirect?: string; routerProps?: HashRouterProps };
export const App: FC<AppProps> = ({ store, redirect, cache, routerProps }) => {
  const [theme, setTheme] = useState<Theme>(getThemeFromStore(store));
  const isDark = theme === darkTheme;

  const background = isDark ? { color: '#bdbdbd', backgroundColor: '#20262D' } : { color: '#1f2020', backgroundColor: '#eaeef2' };

  const containerRef = useRef(null);

  useEffect(() => {
    ContainerService.setContainer(containerRef.current);
  }, [containerRef.current]);

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
  }, []);

  let Main = (
    <ThemeProvider theme={theme}>
      <Box id="synology-download-app-container" sx={{ ...background, height: '100%' }} ref={containerRef}>
        <NotificationStack maxSnack={2} />
        <SettingsInjector />
        <Router {...routerProps}>
          <CssBaseline />
          <Navbar />
          <Panel redirect={redirect} />
        </Router>
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
