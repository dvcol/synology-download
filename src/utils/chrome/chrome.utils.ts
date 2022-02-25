import { Observable } from 'rxjs';

import { parseJSON } from '@src/utils/string.utils';

import StorageArea = chrome.storage.StorageArea;

type ChromeI18nInput = { key: string; substitutions: (string | number)[] };

/**
 * Setup i18n function with modules names
 * @param roots modules names
 * @see chrome.i18n.getMessage
 */
export const useI18n =
  (...roots: string[]): typeof i18n =>
  (value, ...modules): string =>
    i18n(value, ...(modules?.length ? modules : roots));

/**
 * Convert translation using chrome i18n
 * @param value key string or object to translate
 * @param modules optionals modules names
 * @see chrome.i18n.getMessage
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

/**
 * Wrap getAcceptLanguages in observable
 * @see chrome.i18n.getAcceptLanguages
 */
export const getAcceptLanguages = () =>
  new Observable<string[]>((subscriber) =>
    chrome.i18n.getAcceptLanguages((languages) => {
      subscriber.next(languages);
      subscriber.complete();
    })
  );

/**
 * Rxjs wrapper for chrome storage getter
 * @param name the key to extract from storage
 * @param storage the chrome storage object (chrome.storage.sync, chrome.storage.local, ...)
 */
const storageGet = <R>(name: string, storage: StorageArea): Observable<R> =>
  new Observable<R>((subscriber) =>
    storage.get(name, (keys) => {
      subscriber.next(parseJSON<R>(keys[name]));
      subscriber.complete();
    })
  );

/**
 * Rxjs wrapper for chrome storage setter
 * @param name the key to set into storage
 * @param payload the object to serialize into storage
 * @param storage the chrome storage object (chrome.storage.sync, chrome.storage.local, ...)
 */
const storageSet = <R>(name: string, payload: R, storage: StorageArea): Observable<R> =>
  new Observable<R>((subscriber) =>
    storage.set({ [name]: JSON.stringify(payload) }, () => {
      subscriber.next(payload);
      subscriber.complete();
    })
  );

/**
 * Rxjs wrapper for chrome chrome.storage.sync.get
 *
 * @param name the key to extract from storage
 *
 * @see storageGet
 * @see chrome.storage.sync
 */
export const syncGet = <R>(name: string): Observable<R> => storageGet(name, chrome.storage.sync);

/**
 * Rxjs wrapper for chrome chrome.storage.sync.set
 *
 * @param name the key to set into storage
 * @param payload the object to serialize into storage
 *
 * @see storageSet
 * @see chrome.storage.sync
 */
export const syncSet = <R>(name: string, payload: R): Observable<R> => storageSet(name, payload, chrome.storage.sync);

/**
 * Rxjs wrapper for chrome chrome.storage.local.get
 *
 * @param name the key to extract from storage
 *
 * @see storageGet
 * @see chrome.storage.local
 */
export const localGet = <R>(name: string): Observable<R> => storageGet(name, chrome.storage.local);

/**
 * Rxjs wrapper for chrome chrome.storage.local.set
 *
 * @param name the key to set into storage
 * @param payload the object to serialize into storage
 *
 * @see storageSet
 * @see chrome.storage.local
 */
export const localSet = <R>(name: string, payload: R): Observable<R> => storageSet(name, payload, chrome.storage.local);

/** @see chrome.action.setBadgeText */
export const setBadgeText = chrome?.action?.setBadgeText;

/** @see chrome.action.setTitle */
export const setTitle = chrome?.action?.setTitle;

/** @see chrome.action.setBadgeBackgroundColor */
export const setBadgeBackgroundColor = chrome?.action?.setBadgeBackgroundColor;

/** @see chrome.notifications.create */
export const createNotification = chrome?.notifications?.create;

/** @see chrome.tabs.create */
export const createTab = chrome?.tabs?.create;
