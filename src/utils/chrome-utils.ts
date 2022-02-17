type ChromeI18nInput = { key: string; substitutions: (string | number)[] };

/**
 * Setup i18n function with modules names
 * @param roots modules names
 */
export const useI18n =
  (...roots: string[]): typeof i18n =>
  (value, ...modules): string =>
    i18n(value, ...(modules?.length ? modules : roots));

/**
 * Convert translation using chrome i18n
 * @param value key string or object to translate
 * @param modules optionals modules names
 * @see chrome.i18n
 */
export const i18n = (value: string | ChromeI18nInput, ...modules: string[]): string => {
  const path: string = Array.isArray(modules) ? modules.join('__') : modules;

  let key: string;
  let substitution;
  if (typeof value === 'string') {
    key = path ? `${path}__${value}` : value;
  } else {
    key = path ? `${path}__${value.key}` : value.key;
    substitution = value?.substitutions;
  }
  return chrome?.i18n?.getMessage?.(key, substitution) || key;
};
