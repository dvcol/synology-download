import { BaseLoggerService } from '@src/services';

export function patchStorage(_global = window) {
  _global.chrome.storage.local.set = async (items) => {
    BaseLoggerService.debug('chrome.storage.local.set', items);
    const local = JSON.parse(localStorage.getItem('synology.local') ?? '{}') as typeof items;
    localStorage.setItem('synology.local', JSON.stringify({ ...local, ...items }));
    return Promise.resolve();
  };
  _global.chrome.storage.local.get = async (keys) => {
    const local = JSON.parse(localStorage.getItem('synology.local') ?? '{}') as Record<string, unknown>;
    let result = {};
    if (typeof keys === 'string') result = { [keys]: local?.[keys] };
    else if (Array.isArray(keys))
      result = (keys as string[]).reduce<Record<string, any>>(
        (arr, key) => ({
          ...arr,
          [key]: local?.[key],
        }),
        {},
      );
    BaseLoggerService.debug('chrome.storage.local.set', keys);
    return Promise.resolve(result);
  };

  _global.chrome.storage.sync.set = async (items) => {
    const local = JSON.parse(localStorage.getItem('synology.sync') ?? '{}') as typeof items;
    localStorage.setItem('synology.sync', JSON.stringify({ ...local, ...items }));
    BaseLoggerService.debug('chrome.storage.sync.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.sync.get = async (keys) => {
    const local = JSON.parse(localStorage.getItem('synology.sync') ?? '{}') as Record<string, unknown>;
    let result = {};
    if (typeof keys === 'string') result = { [keys]: local?.[keys] };
    else if (Array.isArray(keys))
      result = (keys as string[]).reduce<Record<string, any>>(
        (arr, key) => ({
          ...arr,
          [key]: local?.[key],
        }),
        {},
      );
    BaseLoggerService.debug('chrome.storage.sync.set', keys);
    return Promise.resolve(result);
  };
  return _global.chrome.storage;
}
