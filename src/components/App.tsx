import { CacheProvider } from '@emotion/react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';

import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { SettingsInjector } from '@src/components/panel';
import type { StoreOrProxy } from '@src/models';
import { getTheme, subscribeToTheme } from '@src/themes';

import { NotificationStack } from './common';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';

import type { EmotionCache } from '@emotion/utils';

import type { Theme } from '@mui/material/styles/createTheme';
import type { FC } from 'react';

export const App: FC<{ store: StoreOrProxy; redirect?: string; cache?: EmotionCache }> = ({ store, redirect, cache }) => {
  const [theme, setTheme] = useState<Theme>(getTheme(store));
  const containerRef = useRef(null);

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
  }, []);

  let Main = (
    <ThemeProvider theme={theme}>
      <NotificationStack maxSnack={2} />
      <SettingsInjector />
      <Router>
        <CssBaseline />
        <Navbar getContainer={() => containerRef.current} />
        <Panel redirect={redirect} />
      </Router>
    </ThemeProvider>
  );

  if (cache) Main = <CacheProvider value={cache}>{Main}</CacheProvider>;

  return (
    <React.StrictMode>
      <Provider store={store}>
        <Box ref={containerRef}>{Main}</Box>
      </Provider>
    </React.StrictMode>
  );
};
