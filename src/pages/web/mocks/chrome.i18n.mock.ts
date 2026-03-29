import type { Locale, Locales } from '../models/locales.model';

import { deepMerge } from '../../../utils/object.utils';

const trailingDotSlashRegex = /\.\/?$/;

export async function patchI18n(_global: Window = window, lang = 'en') {
  _global.chrome.i18n.getMessage = (key: string) => _global._locales?.[lang]?.[key]?.message ?? key;

  if (!_global._localesFetch) _global._localesFetch = {};
  if (!_global._locales) _global._locales = {};

  const locale = _global._locales?.[lang];
  if (locale) return;

  let locale$ = _global._localesFetch?.[lang];
  if (locale$ === undefined) {
    const base = import.meta.env.BASE_URL?.replace(trailingDotSlashRegex, '/') ?? '/';
    locale$ = fetch(`${base}_locales/${lang}/messages.json`)
      .then(async res => res.json() as Promise<Locale>)
      .catch((err: Error) => {
        console.error('failed to load locales', { lang, err });
        return {};
      });
    _global._localesFetch[lang] = locale$;
  }
  _global._locales[lang] = await locale$;

  return _global._locales[lang];
}

export function patchLocales(locales?: Locales, _global: Window = window) {
  if (!_global._locales) _global._locales = {};
  if (locales) _global._locales = deepMerge(_global._locales, locales);
  return _global._locales;
}
