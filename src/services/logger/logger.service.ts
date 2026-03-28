import type { Log, ServiceInstance } from '../../models/settings.model';
import type { StoreOrProxy } from '../../models/store.model';

import { Subject, takeUntil } from 'rxjs';

import { LoggingLevel } from '../../models/logger.model';
import { ChromeMessageType } from '../../models/message.model';
import { defaultLoggingLevels, ServiceInstanceColorsMap } from '../../models/settings.model';
import { addLogHistory } from '../../store/actions/state.action';
import { getAdvancedSettingsLogging } from '../../store/selectors/settings.selector';
import { onMessage, sendMessage } from '../../utils/chrome/chrome-message.utils';
import { store$ } from '../../utils/rxjs.utils';
import { ProxyLogger } from '../../utils/webex.utils';
import { BaseLoggerService } from './base-logger.service';

export class LoggerService extends BaseLoggerService {
  protected static source: ServiceInstance;

  private static store: StoreOrProxy;
  private static isProxy: boolean;

  private static history = false;
  private static historyMax = 1000;

  private static _destroy$ = new Subject<void>();

  static init({ source, store, isProxy }: { store: StoreOrProxy; source: ServiceInstance; isProxy?: boolean }) {
    super.init({ source, color: ServiceInstanceColorsMap[source] });
    this.destroy();

    ProxyLogger.init(this);

    this.store = store;
    this.isProxy = isProxy ?? false;

    store$(store, getAdvancedSettingsLogging)
      .pipe(takeUntil(this._destroy$))
      .subscribe((settings) => {
        this.level = (settings.levels ?? defaultLoggingLevels)[this.source] ?? this.level;
        this.enabled = !!settings.enabled;
        this.history = settings.history ?? this.history;
        this.historyMax = settings.historyMax ?? this.historyMax;
      });

    if (!this.isProxy) {
      onMessage<Log>([ChromeMessageType.logger])
        .pipe(takeUntil(this._destroy$))
        .subscribe(({ message: { payload }, sendResponse }) => {
          if (payload) this.dispatch(payload);
          sendResponse();
        });
    }

    console.info(...this.timestamp, 'Logger service initialized');
  }

  static destroy() {
    this._destroy$.next();
    this._destroy$.complete();

    // Restore subject for subsequent-init
    this._destroy$ = new Subject();

    ProxyLogger.reset();
  }

  private static dispatch(log: Log) {
    void this.store?.dispatch(addLogHistory({ log, max: this.historyMax }));
  }

  /**
   * Capture info logs and above and forward them to the background
   * @param level the log level of the call
   * @param value the message value
   * @param params any parameters
   * @private
   */
  private static capture(level: LoggingLevel, value: unknown, params?: any[]) {
    if (!this.history || !this.store) return;
    if (level < LoggingLevel.info) return;

    const log: Log = { timestamp: new Date().toISOString(), level, source: this.source, value: value?.toString() ?? 'undefined', params: params?.toString() };

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

  static trace(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.trace, message, params);
    return super.trace(message, ...(params as [any]));
  }

  static debug(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.debug, message, params);
    return super.debug(message, ...(params as [any]));
  }

  static info(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.info, message, params);
    return super.info(message, ...(params as [any]));
  }

  static warn(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.warn, message, params);
    return super.warn(message, ...(params as [any]));
  }

  static error(message?: any, ...params: any[]) {
    this.capture(LoggingLevel.error, message, params);
    return super.error(message, ...(params as [any]));
  }
}
