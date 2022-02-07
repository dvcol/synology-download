import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import { NotificationStack } from '@src/components';
import { QuickMenuDialog } from '@src/pages/content/components/quick-menu-dialog';
import { TaskDialog } from '@src/pages/content/components/task-dialog';
import { EmotionCache } from '@emotion/utils';
import { StoreOrProxy } from '@src/models';
import { Theme } from '@mui/material/styles/createTheme';
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
