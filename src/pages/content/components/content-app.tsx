import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { CacheProvider } from '@emotion/react';
import { EmotionCache } from '@emotion/utils';
import { ThemeProvider } from '@mui/material';
import { Theme } from '@mui/material/styles/createTheme';

import { NotificationStack } from '@src/components';
import { QuickMenuDialog, TaskDialog } from '@src/pages/content/components';
import { StoreOrProxy } from '@src/models/store.model';
import { getTheme, subscribeToTheme } from '@src/themes';

export const ContentApp = ({ store, cache, container }: { store: StoreOrProxy; cache: EmotionCache; container: HTMLElement }) => {
  const [theme, setTheme] = useState<Theme>(getTheme(store));

  useEffect(() => {
    const sub = subscribeToTheme(store, theme, setTheme);
    return () => sub.unsubscribe();
  }, []);

  return (
    <React.StrictMode>
      <Provider store={store}>
        <CacheProvider value={cache}>
          <ThemeProvider theme={theme}>
            <NotificationStack maxSnack={5} />
            <QuickMenuDialog container={container} />
            <TaskDialog container={container} />
          </ThemeProvider>
        </CacheProvider>
      </Provider>
    </React.StrictMode>
  );
};
