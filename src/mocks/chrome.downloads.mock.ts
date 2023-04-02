export const patchDownloads = (_global = window) => {
  _global.chrome.downloads.search = query => {
    console.debug('chrome.downloads.search', query);
    return Promise.resolve([]);
  };
  _global.chrome.downloads.erase = query => {
    console.debug('chrome.downloads.erase', query);
    return Promise.resolve([0]);
  };
  _global.chrome.downloads.download = query => {
    console.debug('chrome.downloads.download', query);
    return Promise.resolve(0);
  };
  _global.chrome.downloads.pause = downloadId => {
    console.debug('chrome.downloads.pause', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.resume = downloadId => {
    console.debug('chrome.downloads.resume', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.cancel = downloadId => {
    console.debug('chrome.downloads.cancel', downloadId);
    return Promise.resolve();
  };
  _global.chrome.downloads.open = downloadId => {
    console.debug('chrome.downloads.open', downloadId);
    return Promise.resolve();
  };
  return _global.chrome.downloads;
};
