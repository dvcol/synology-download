import type { EmotionCache } from '@emotion/utils';
import type { Theme } from '@mui/material';
import type { Store } from 'redux';

import type { AppInstance } from '@src/models';
import type { StoreOrProxy } from '@src/models/store.model';

import { CacheProvider } from '@emotion/react';
import { ThemeProvider } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';

import { ContainerContextProvider, NotificationStack } from '@src/components';
import { ContentTaskDialog, QuickMenuDialog } from '@src/pages/content/components';
import { store } from '@src/store';
import { getThemeFromStore, subscribeToTheme } from '@src/themes';

export function ContentApp({
  storeOrProxy,
  cache,
  container,
  instance,
}: {
  storeOrProxy: StoreOrProxy;
  cache: EmotionCache;
  container: HTMLElement;
  instance: AppInstance;
}) {
  const [theme, setTheme] = useState<Theme>(() => getThemeFromStore(store));

  const _store = storeOrProxy;

  useEffect(() => {
    const sub = subscribeToTheme(_store, theme, setTheme);
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this once
  }, []);

  const containerRef = useRef(container);

  return (
    <React.StrictMode>
      <Provider store={_store as Store}>
        <ContainerContextProvider instance={instance} containerRef={containerRef}>
          <CacheProvider value={cache}>
            <ThemeProvider theme={theme}>
              <NotificationStack maxSnack={5} />
              <QuickMenuDialog container={container} />
              <ContentTaskDialog container={container} />
            </ThemeProvider>
          </CacheProvider>
        </ContainerContextProvider>
      </Provider>
    </React.StrictMode>
  );
}
