/* eslint-disable no-console */
import type { StoreOrProxy } from '@src/models';
import { LoggingLevel } from '@src/models';
import { store$ } from '@src/store';
import { getAdvancedSettingsLogging } from '@src/store/selectors';

export class LoggerService {
  private static store: any | StoreOrProxy;
  private static level: number | LoggingLevel = -1;
  private static enabled = false;

  private static filter(level: LoggingLevel) {
    return !this.enabled || this.level > level;
  }

  static init(store: StoreOrProxy) {
    this.store = store;

    store$(this.store, getAdvancedSettingsLogging).subscribe(settings => {
      this.level = settings.level ?? this.level;
      this.enabled = !!settings.enabled;
    });

    this.debug('Logger service initialized');
  }

  static trace(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.trace)) return;
    console.trace(message, ...optionalParams);
  }
  static debug(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.debug)) return;
    console.debug(message, ...optionalParams);
  }
  static info(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.info)) return;
    console.info(message, ...optionalParams);
  }
  static warn(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.warn)) return;
    console.warn(message, ...optionalParams);
  }
  static error(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.error)) return;
    console.error(message, ...optionalParams);
  }
}
/* eslint-enable no-console */
