import { CacheProvider } from '@emotion/react';

import { ThemeProvider } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { Provider } from 'react-redux';

import { NotificationStack } from '@src/components';
import type { StoreOrProxy } from '@src/models/store.model';
import { ContentTaskDialog, QuickMenuDialog } from '@src/pages/content/components';
import { store } from '@src/store';
import { getThemeFromStore, subscribeToTheme } from '@src/themes';

import type { EmotionCache } from '@emotion/utils';
import type { Theme } from '@mui/material';

export const ContentApp = ({ storeOrProxy, cache, container }: { storeOrProxy: StoreOrProxy; cache: EmotionCache; container: HTMLElement }) => {
  const [theme, setTheme] = useState<Theme>(getThemeFromStore(store));

  const _store = storeOrProxy;

  useEffect(() => {
    const sub = subscribeToTheme(_store, theme, setTheme);
    return () => sub.unsubscribe();
  }, []);

  return (
    <React.StrictMode>
      <Provider store={_store}>
        <CacheProvider value={cache}>
          <ThemeProvider theme={theme}>
            <NotificationStack maxSnack={5} />
            <QuickMenuDialog container={container} />
            <ContentTaskDialog container={container} />
          </ThemeProvider>
        </CacheProvider>
      </Provider>
    </React.StrictMode>
  );
};
