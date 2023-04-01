import { defineComponents } from './modules';

export type Locale = Record<string, { message: string; descriptions?: string }>;
export type Locales = Record<string, Locale>;
export type LocalesFetch = Record<string, Promise<Locale>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window {
    _locales?: Locales;
    _localesFetch?: LocalesFetch;
  }
}

export { defineComponents };

export default defineComponents;
