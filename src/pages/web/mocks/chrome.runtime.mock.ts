import manifest from '../../../manifest.json';
import { BaseLoggerService } from '../../../services/logger/base-logger.service';

export function patchRuntime(_global = window) {
  _global.chrome.runtime.getManifest = () => {
    BaseLoggerService.debug('chrome.runtime.getManifest', manifest);
    return manifest as chrome.runtime.Manifest;
  };

  _global.chrome.runtime.sendMessage = (<M = any>(message: M, responseCallback: (response: any) => void) => {
    BaseLoggerService.debug('chrome.runtime.sendMessage', message);
    responseCallback(null);
  }) as typeof chrome.runtime['sendMessage'];

  return _global.chrome.runtime;
}
