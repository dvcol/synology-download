import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { darkTheme } from '../../themes';
import { BrowserRouter as Router } from 'react-router-dom';
import { Navbar } from '../../components/navbar/navbar';
import { Panel } from '../../components/panel/panel';
import { getUrl, proxyStore } from '../../store';
import { synologyClient } from '../../services';

// TODO custom UI for options
proxyStore
  .ready()
  .then(() => {
    // Restore client url
    const url = getUrl(proxyStore.getState());
    if (url) synologyClient.setBaseUrl(url);
  })
  .then(() =>
    render(
      <React.StrictMode>
        <Provider store={proxyStore}>
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
