import React from 'react';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme } from '@src/themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar } from './navbar/navbar';
import { Panel } from './panel/panel';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { NotificationStack } from './common';

export const App = ({ store }: { store: Store | ProxyStore }) => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={darkTheme()}>
          <NotificationStack maxSnack={1} />
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
