export const AppRoute = {
  All: '*',
  Panel: '/',
  Add: '/add',
  Scrape: '/scrape',
  Settings: '/settings',
  Config: '/config',
  About: '/about',
} as const;

export type AppRoutes = (typeof AppRoute)[keyof typeof AppRoute];
