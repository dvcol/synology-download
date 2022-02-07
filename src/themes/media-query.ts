import { fromEventPattern, Subscription } from 'rxjs';
import { getThemeMode } from '@src/store/selectors';
import { darkTheme, lightTheme } from '@src/themes/themes';
import { StoreOrProxy } from '@src/models';
import { Theme } from '@mui/material/styles/createTheme';
import { Dispatch, SetStateAction } from 'react';
import { store$ } from '@src/store';

export const isDarkTheme = (): boolean => window.matchMedia('(prefers-color-scheme: dark').matches;

export const isDarkTheme$ = fromEventPattern<MediaQueryListEvent>(
  (handler) => window.matchMedia('(prefers-color-scheme: dark').addEventListener('change', handler),
  (handler) => window.matchMedia('(prefers-color-scheme: dark').removeEventListener('change', handler)
);

export const getTheme = (store?: StoreOrProxy, isDark: boolean = isDarkTheme()) => {
  if (store) return getThemeMode(store.getState()) ?? isDark ? darkTheme : lightTheme;
  return isDark ? darkTheme : lightTheme;
};

export const subscribeToTheme = (store: StoreOrProxy, theme: Theme, setTheme: Dispatch<SetStateAction<Theme>>): Subscription => {
  // On Os theme change
  const subscription = isDarkTheme$.subscribe(({ matches }) => setTheme(getTheme(store, matches)));

  // On store theme change
  subscription.add(store$(store, getThemeMode).subscribe((_theme) => setTheme(_theme ?? getTheme())));

  return subscription;
};
