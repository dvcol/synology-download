import type { Theme } from '@mui/material';
import type { Dispatch, SetStateAction } from 'react';
import type { Subscription } from 'rxjs';

import type { StoreOrProxy } from '../models/store.model';

import { fromEventPattern } from 'rxjs';

import { ThemeMode } from '../models/settings.model';
import { getTheme } from '../store/selectors/settings.selector';
import { store$ } from '../utils/rxjs.utils';
import { darkTheme, lightTheme } from './themes';

export const isDarkTheme = (): boolean => window.matchMedia('(prefers-color-scheme: dark)').matches;

export const isDarkTheme$ = fromEventPattern<MediaQueryListEvent>(
  handler => window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler),
  handler => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler),
);

export function getThemeFromStore(store?: StoreOrProxy, isDark: boolean = isDarkTheme()) {
  if (store) return getTheme(store.getState()) ?? isDark ? darkTheme : lightTheme;
  return isDark ? darkTheme : lightTheme;
}

export function subscribeToTheme(store: StoreOrProxy, theme: Theme, setTheme: Dispatch<SetStateAction<Theme>>): Subscription {
  // On Os theme change
  const subscription = isDarkTheme$.subscribe(({ matches }) => setTheme(getThemeFromStore(store, matches)));

  // On store theme change
  subscription.add(store$<Theme | null>(store, getTheme).subscribe(_theme => setTheme(_theme ?? getThemeFromStore())));

  return subscription;
}

export function preferDark(mode?: ThemeMode): boolean {
  if (!mode || mode === ThemeMode.auto) return isDarkTheme();
  return mode === ThemeMode.dark;
}
