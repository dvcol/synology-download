import { ProxyLogger } from '@dvcol/web-extension-utils';

import type { Log, ServiceInstance, StoreOrProxy } from '@src/models';
import { ChromeMessageType, defaultLoggingLevels, LoggingLevel } from '@src/models';
import { addLogHistory } from '@src/store/actions';
import { getAdvancedSettingsLogging } from '@src/store/selectors';
import { onMessage, sendMessage, store$ } from '@src/utils';

export class LoggerService {
  private static source: ServiceInstance;
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;

  private static level: LoggingLevel | number = 4;
  private static enabled = true;
  private static history = false;
  private static historyMax = 1000;

  static init(store: StoreOrProxy, source: ServiceInstance, isProxy = false) {
    this.store = store;
    this.source = source;
    this.isProxy = isProxy;

    ProxyLogger.init(LoggerService);

    store$(store, getAdvancedSettingsLogging).subscribe(settings => {
      this.level = (settings.levels ?? defaultLoggingLevels)[this.source] ?? this.level;
      this.enabled = !!settings.enabled;
      this.history = settings.history ?? this.history;
      this.historyMax = settings.historyMax ?? this.historyMax;
    });

    if (!this.isProxy) {
      onMessage<Log>([ChromeMessageType.logger]).subscribe(({ message: { payload }, sendResponse }) => {
        if (payload) this.dispatch(payload);
        sendResponse();
      });
    }

    console.debug(this.timestamp, 'Logger service initialized');
  }

  private static dispatch(log: Log) {
    this.store?.dispatch(addLogHistory({ log, max: this.historyMax }));
  }

  /**
   * Filters logs below active log level
   * @param level log level of the call
   * @private
   */
  private static filter(level: LoggingLevel) {
    if (process.env.DEBUG === 'true') return false;
    return !this.enabled || this.level > level;
  }

  /**
   * Capture info logs and above and forward them to the background
   * @param level the log level of the call
   * @param value the message value
   * @param params any parameters
   * @private
   */
  private static capture(level: LoggingLevel, value: any, params?: any[]) {
    if (!this.history || !this.store) return;
    if (level < LoggingLevel.info) return;

    const log: Log = { timestamp: new Date().toISOString(), level, source: this.source, value: value?.toString(), params: params?.toString() };

    if (this.isProxy) {
      return sendMessage<Log>({
        type: ChromeMessageType.logger,
        payload: log,
      }).subscribe({
        error: e => console.warn(this.timestamp, 'Log dispatch failed, forward ended in error.', e),
      });
    }
    this.dispatch(log);
  }

  private static captureAndFilter(level: LoggingLevel, message?: any, params?: any[]) {
    this.capture(level, message, params);
    return this.filter(level);
  }

  static get timestamp(): string {
    return `[${new Date()?.toISOString()} - ${this.source}]`;
  }

  /* eslint-disable no-console */
  static trace(message?: any, ...params: any[]) {
    if (this.captureAndFilter(LoggingLevel.trace, message, params)) return;
    return console.trace(this.timestamp, message, ...params);
  }

  static debug(message?: any, ...params: any[]) {
    if (this.captureAndFilter(LoggingLevel.debug, message, params)) return;
    return console.debug(this.timestamp, message, ...params);
  }

  static info(message?: any, ...params: any[]) {
    if (this.captureAndFilter(LoggingLevel.info, message, params)) return;
    return console.info(this.timestamp, message, ...params);
  }

  static warn(message?: any, ...params: any[]) {
    if (this.captureAndFilter(LoggingLevel.warn, message, params)) return;
    return console.warn(this.timestamp, message, ...params);
  }

  static error(message?: any, ...params: any[]) {
    if (this.captureAndFilter(LoggingLevel.error, message, params)) return;
    return console.error(this.timestamp, message, ...params);
  }
  /* eslint-enable no-console */
}
