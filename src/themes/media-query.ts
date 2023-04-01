import { fromEventPattern } from 'rxjs';

import type { StoreOrProxy } from '@src/models';
import { getTheme } from '@src/store/selectors';
import { darkTheme, lightTheme } from '@src/themes/themes';

import { store$ } from '@src/utils';

import type { Theme } from '@mui/material/styles/createTheme';
import type { Dispatch, SetStateAction } from 'react';
import type { Subscription } from 'rxjs';

export const isDarkTheme = (): boolean => window.matchMedia('(prefers-color-scheme: dark').matches;

export const isDarkTheme$ = fromEventPattern<MediaQueryListEvent>(
  handler => window.matchMedia('(prefers-color-scheme: dark').addEventListener('change', handler),
  handler => window.matchMedia('(prefers-color-scheme: dark').removeEventListener('change', handler),
);

export const getThemeFromStore = (store?: StoreOrProxy, isDark: boolean = isDarkTheme()) => {
  if (store) return getTheme(store.getState()) ?? isDark ? darkTheme : lightTheme;
  return isDark ? darkTheme : lightTheme;
};

export const subscribeToTheme = (store: StoreOrProxy, theme: Theme, setTheme: Dispatch<SetStateAction<Theme>>): Subscription => {
  // On Os theme change
  const subscription = isDarkTheme$.subscribe(({ matches }) => setTheme(getThemeFromStore(store, matches)));

  // On store theme change
  subscription.add(store$<Theme | null>(store, getTheme).subscribe(_theme => setTheme(_theme ?? getThemeFromStore())));

  return subscription;
};
