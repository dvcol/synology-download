export const patchStorage = (_global = window) => {
  _global.chrome.storage.local.set = items => {
    console.debug('chrome.storage.local.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.local.get = keys => {
    console.debug('chrome.storage.local.set', keys);
    return Promise.resolve({});
  };

  _global.chrome.storage.sync.set = items => {
    console.debug('chrome.storage.sync.set', items);
    return Promise.resolve();
  };
  _global.chrome.storage.sync.get = keys => {
    console.debug('chrome.storage.sync.set', keys);
    return Promise.resolve({});
  };
  return _global.chrome.storage;
};
