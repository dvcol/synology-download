import type { StoreOrProxy } from '@src/models';
import { LoggingLevel } from '@src/models';
import { getAdvancedSettingsLogging } from '@src/store/selectors';
import { store$ } from '@src/utils';

export class LoggerService {
  private static level: LoggingLevel | number = -1;
  private static enabled = true;

  private static filter(level: LoggingLevel) {
    if (process.env.DEBUG === 'true') return false;
    return !this.enabled || this.level > level;
  }

  static init(store: StoreOrProxy) {
    store$(store, getAdvancedSettingsLogging).subscribe(settings => {
      this.level = settings.level ?? this.level;
      this.enabled = !!settings.enabled;
    });

    this.debug('Logger service initialized');
  }
  /* eslint-disable no-console */
  static trace(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.trace)) return;
    return console.trace(message, ...optionalParams);
  }

  static debug(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.debug)) return;
    return console.debug(message, ...optionalParams);
  }

  static info(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.info)) return;
    return console.info(message, ...optionalParams);
  }

  static warn(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.warn)) return;
    return console.warn(message, ...optionalParams);
  }

  static error(message?: any, ...optionalParams: any[]) {
    if (this.filter(LoggingLevel.error)) return;
    return console.error(message, ...optionalParams);
  }
  /* eslint-enable no-console */
}
