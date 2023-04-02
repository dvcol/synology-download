export const patchDownloads = (_global = window) => {
  _global.chrome.downloads.search = () => Promise.resolve([]);
  return _global.chrome.downloads;
};
