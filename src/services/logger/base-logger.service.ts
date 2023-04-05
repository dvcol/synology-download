import { LoggingLevel } from '@src/models';

export class BaseLoggerService {
  protected static source: string;
  protected static color: string;

  protected static level: LoggingLevel | number = 4;
  protected static enabled = true;

  static init({ source, color }: { source: string; color?: string }) {
    this.source = source;
    this.color = color ?? '#96c4ff';
  }

  /**
   * Filters logs below active log level
   * @param level log level of the call
   * @private
   */
  protected static filter(level: LoggingLevel) {
    if (process.env.DEBUG === 'true') return false;
    return !this.enabled || this.level > level;
  }

  static get timestamp(): string[] {
    return [`%c[${new Date()?.toISOString()} - %c${this.source}%c]`, '', `color: ${this.color};`, ''];
  }

  /* eslint-disable no-console */
  static trace(message?: any, ...params: any[]) {
    if (this.filter(LoggingLevel.trace)) return;
    return console.trace(...this.timestamp, message, ...params);
  }

  static debug(message?: any, ...params: any[]) {
    if (this.filter(LoggingLevel.debug)) return;
    return console.debug(...this.timestamp, message, ...params);
  }

  static info(message?: any, ...params: any[]) {
    if (this.filter(LoggingLevel.info)) return;
    return console.info(...this.timestamp, message, ...params);
  }

  static warn(message?: any, ...params: any[]) {
    if (this.filter(LoggingLevel.warn)) return;
    return console.warn(...this.timestamp, message, ...params);
  }

  static error(message?: any, ...params: any[]) {
    if (this.filter(LoggingLevel.error)) return;
    return console.error(...this.timestamp, message, ...params);
  }
  /* eslint-enable no-console */
}
