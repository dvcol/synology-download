import type { Locales } from '@src/pages/web/models';
import { deepMerge } from '@src/utils/object.utils';

export const patchI18n = async (_global: Window = window, lang = 'en') => {
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

  return _global._locales[lang];
};

export const patchLocales = (locales?: Locales, _global: Window = window) => {
  if (!_global._locales) _global._locales = {};
  if (locales) _global._locales = deepMerge(_global._locales, locales);
  return _global._locales;
};
