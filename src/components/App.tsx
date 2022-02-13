import React, { FC, useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { getTheme, subscribeToTheme } from '@src/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';
import { NotificationStack } from './common';
import { StoreOrProxy } from '@src/models';
import { Theme } from '@mui/material/styles/createTheme';

export const App: FC<{ store: StoreOrProxy }> = ({ store }) => {
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
          <Router>
            <CssBaseline />
            <Navbar />
            <Panel />
          </Router>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>
  );
};
