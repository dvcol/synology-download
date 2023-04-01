export const mockI18n = async (lang = 'en', _global: Window = window) => {
  _global.chrome.i18n.getMessage = (key: string) => _global._locales?.[lang]?.[key]?.message ?? key;

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
