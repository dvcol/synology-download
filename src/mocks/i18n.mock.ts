type Locale = Record<string, { message: string; descriptions?: string }>;
type Locales = Record<string, Locale>;
type LocalesFetch = Record<string, Promise<Locale>>;

declare global {
  interface Global {
    _locales?: Locales;
    _localesFetch?: LocalesFetch;
  }
}

export const mockI18n = async (lang = 'en', _global: Global = global as Global) => {
  global.chrome.i18n.getMessage = (key: string) => (global as Global)._locales?.[lang]?.[key]?.message ?? key;

  if (!_global._localesFetch) _global._localesFetch = {};
  if (!_global._locales) _global._locales = {};

  const locale = _global._locales?.[lang];
  if (locale) return;

  let locale$ = _global._localesFetch?.[lang];
  if (!locale$) {
    locale$ = fetch(`_locales/${lang}/messages.json`)
      .then(res => res.json())
      .catch(err => {
        console.error('failed to load locales', { lang, err });
        return {};
      });
    _global._localesFetch[lang] = locale$;
  }
  _global._locales[lang] = await locale$;
};
