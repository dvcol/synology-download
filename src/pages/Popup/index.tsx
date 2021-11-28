import React from 'react';
import { render } from 'react-dom';
import './index.scss';

import { Provider } from 'react-redux';
import { Store } from 'webext-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { darkTheme } from '../../themes';
import { Navbar, Panel } from '../../components';

const store = new Store();

store.ready().then(() =>
  render(
    <React.StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={darkTheme()}>
          <Router>
            <CssBaseline />
            <Navbar />
            <Panel />
          </Router>
        </ThemeProvider>
      </Provider>
    </React.StrictMode>,
    window.document.querySelector('#app-container')
  )
);

if (module.hot) module.hot.accept();
