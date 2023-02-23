import { CssBaseline, ThemeProvider } from '@mui/material';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import { SettingsInjector } from '@src/components/panel';
import type { StoreOrProxy } from '@src/models';
import { getTheme, subscribeToTheme } from '@src/themes';

import { NotificationStack } from './common';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';

import type { Theme } from '@mui/material/styles/createTheme';
import type { FC } from 'react';

export const App: FC<{ store: StoreOrProxy; redirect?: string }> = ({ store, redirect }) => {
  const [theme, setTheme] = useState<Theme>(getTheme(store));

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
  }, []);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <NotificationStack maxSnack={2} />
          <SettingsInjector />
          <Router>
            <CssBaseline />
            <Navbar />
            <Panel redirect={redirect} />
          </Router>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );
};
