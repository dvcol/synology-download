export enum AppInstance {
  option = 'synology-download-option',
  popup = 'synology-download-popup',
  panel = 'synology-download-panel',
  content = 'synology-download-content',
  standalone = 'synology-download-standalone',
}

export const setInstance = (instance: AppInstance) => {
  if (!window) return;
  window._instance = instance;
};

export const getInstance = () => window?._instance;
export const isInstance = (instance: AppInstance) => getInstance() === instance;
