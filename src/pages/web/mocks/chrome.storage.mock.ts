import { BaseLoggerService } from '@src/services';

export const patchStorage = (_global = window) => {
  _global.chrome.storage.local.set = items => {
    BaseLoggerService.debug('chrome.storage.local.set', items);
    const local = JSON.parse(localStorage.getItem('synology.local') ?? '{}');
    localStorage.setItem('synology.local', JSON.stringify({ ...local, ...items }));
    return Promise.resolve();
  };
  _global.chrome.storage.local.get = keys => {
    const local = JSON.parse(localStorage.getItem('synology.local') ?? '{}');
    let result = {};
    if (typeof keys === 'string') result = { [keys]: local?.[keys] };
    else if (Array.isArray(keys)) result = (keys as string[]).reduce<Record<string, any>>((arr, key) => ({ ...arr, [key]: local?.[key] }), {});
    BaseLoggerService.debug('chrome.storage.local.set', keys);
    return Promise.resolve(result);
  };

  _global.chrome.storage.sync.set = items => {
    const local = JSON.parse(localStorage.getItem('synology.sync') ?? '{}');
    localStorage.setItem('synology.sync', JSON.stringify({ ...local, ...items }));
    BaseLoggerService.debug('chrome.storage.sync.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.sync.get = keys => {
    const local = JSON.parse(localStorage.getItem('synology.sync') ?? '{}');
    let result = {};
    if (typeof keys === 'string') result = { [keys]: local?.[keys] };
    else if (Array.isArray(keys)) result = (keys as string[]).reduce<Record<string, any>>((arr, key) => ({ ...arr, [key]: local?.[key] }), {});
    BaseLoggerService.debug('chrome.storage.sync.set', keys);
    return Promise.resolve(result);
  };
  return _global.chrome.storage;
};
