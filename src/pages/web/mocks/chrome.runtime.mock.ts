import manifest from '@src/manifest.json';
import { BaseLoggerService } from '@src/services';

export const patchRuntime = (_global = window) => {
  _global.chrome.runtime.getManifest = () => {
    BaseLoggerService.debug('chrome.runtime.getManifest', manifest);
    return manifest as any;
  };

  _global.chrome.runtime.sendMessage = (<M = any>(message: M, responseCallback: (response: any) => void) => {
    BaseLoggerService.debug('chrome.runtime.sendMessage', message);
    responseCallback(null);
  }) as any;

  return _global.chrome.runtime;
};
