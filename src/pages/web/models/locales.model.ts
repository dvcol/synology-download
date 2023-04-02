export type Locale = Record<string, { message: string; descriptions?: string }>;
export type Locales = Record<string, Locale>;
export type LocalesFetch = Record<string, Promise<Locale>>;
