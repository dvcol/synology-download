export const patchAction = (_global = window) => {
  _global.chrome.action.setBadgeText = badge => {
    console.debug('chrome.action.setBadgeText', badge);
    return Promise.resolve();
  };
  _global.chrome.action.setTitle = title => {
    console.debug('chrome.action.setTitle', title);
    return Promise.resolve();
  };
  return _global.chrome.action;
};
