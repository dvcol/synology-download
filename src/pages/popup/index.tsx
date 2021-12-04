import React from 'react';
import { render } from 'react-dom';

import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import { darkTheme } from '../../themes';
import { Navbar, Panel } from '../../components';
import { proxyStore } from '../../store';
import { QueryService } from '../../services';
import { ModalInstance } from '../../models';

proxyStore
  .ready()
  .then(() => {
    // Set store to query service
    QueryService.init(proxyStore);
    proxyStore.subscribe(() => console.log('proxy store change', proxyStore.getState()));
    // Register as open
    chrome.runtime.connect({ name: ModalInstance.popup });
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
