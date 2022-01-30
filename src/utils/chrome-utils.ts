type ChromeI18nInput = { key: string; substitutions: string[] };

/**
 * Setup i18n function with modules names
 * @param roots modules names
 */
export const useI18n =
  (roots: string | string[]): typeof i18n =>
  (value, modules): string => {
    console.log(value, modules, roots, modules ?? roots);
    return i18n(value, modules ?? roots);
  };

/**
 * Convert translation using chrome i18n
 * @param value key string or object to translate
 * @param modules optionals modules names
 * @see chrome.i18n
 */
export const i18n = (value: string | ChromeI18nInput, modules?: string | string[]): string => {
  const path = Array.isArray(modules) ? modules?.join('__') : modules;
  if (typeof value === 'string') return chrome.i18n.getMessage(path ? `${path}__${value}` : value);
  return chrome.i18n.getMessage(path ? `${path}__${value.key}` : value.key, value?.substitutions);
};
