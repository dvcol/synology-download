import type { Log, ServiceInstance, StoreOrProxy } from '@src/models';
import { ChromeMessageType, defaultLoggingLevels, LoggingLevel, ServiceInstanceColorsMap } from '@src/models';
import { BaseLoggerService } from '@src/services';
import { addLogHistory } from '@src/store/actions';
import { getAdvancedSettingsLogging } from '@src/store/selectors';
import { onMessage, ProxyLogger, sendMessage, store$ } from '@src/utils';

export class LoggerService extends BaseLoggerService {
  protected static source: ServiceInstance;

  private static store: any | StoreOrProxy;
  private static isProxy: boolean;

  private static history = false;
  private static historyMax = 1000;

  static init({ source, store, isProxy }: { store: StoreOrProxy; source: ServiceInstance; isProxy?: boolean }) {
    super.init({ source, color: ServiceInstanceColorsMap[source] });

    ProxyLogger.init(this);

    this.store = store;
    this.isProxy = isProxy ?? false;

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

    console.debug(...this.timestamp, 'Logger service initialized');
  }

  private static dispatch(log: Log) {
    this.store?.dispatch(addLogHistory({ log, max: this.historyMax }));
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
        error: e => console.warn(...this.timestamp, 'Log dispatch failed, forward ended in error.', e),
      });
    }
    this.dispatch(log);
  }

  /* eslint-disable no-console */
  static trace(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.trace, message, params);
    return super.trace(message, ...params);
  }

  static debug(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.debug, message, params);
    return super.debug(message, ...params);
  }

  static info(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.info, message, params);
    return super.info(message, ...params);
  }

  static warn(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.warn, message, params);
    return super.warn(message, ...params);
  }

  static error(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.error, message, params);
    return super.error(message, ...params);
  }
  /* eslint-enable no-console */
}
