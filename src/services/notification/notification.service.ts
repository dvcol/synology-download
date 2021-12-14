import { parse, ParsedQuery } from 'query-string';
import { filter, map, Observable, Subject, tap } from 'rxjs';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { getNotificationsBannerLevel, getNotificationsEnabled, getTasksCount, setTasksCount, store$ } from '../../store';
import { bufferDebounceUnless, skipUntilRepeat } from '../../utils';
import { ChromeMessage, ChromeMessageType, ChromeNotification, NotificationLevel, NotificationLevelKeys } from '../../models';

export class NotificationService {
  private static store: any | Store | ProxyStore;
  private static isProxy: boolean;

  private static readonly stop$ = new Subject<void>();
  private static readonly start$ = new Subject<void>();

  private static readonly notify$ = new Subject<ChromeNotification>();
  private static readonly error$ = new Subject<ChromeNotification>();

  static get enabled(): boolean {
    return getNotificationsEnabled(this.store.getState());
  }

  static get level(): NotificationLevel {
    return getNotificationsBannerLevel(this.store.getState());
  }

  private static bufferStopStart =
    (title: string, message: string) =>
    (source$: Observable<ChromeNotification>): Observable<ChromeNotification | undefined> =>
      source$.pipe(
        filter(({ priority }) => Number(priority) + 2 >= this.level), // because Chrome scale is -2 to 2
        bufferDebounceUnless(400, 10),
        skipUntilRepeat(() => !this.enabled, this.stop$, this.start$),
        map((n) => this.handleNotification(n, title, message)),
        tap((n) => n && chrome.notifications.create(n))
      );

  static init(store: Store | ProxyStore, isProxy = false): void {
    this.store = store;
    this.isProxy = isProxy;
    this.notify$.pipe(this.bufferStopStart('Notification', '')).subscribe();
    this.error$.pipe(this.bufferStopStart('Errors', '')).subscribe();

    store$(this.store, getTasksCount).subscribe((count) => this.store.dispatch(setTasksCount(count)));

    if (!isProxy) {
      chrome.runtime.onMessage.addListener(({ type, payload }: ChromeMessage) => {
        if (type === ChromeMessageType.notification) this.sendOrForward(payload as ChromeNotification);
      });
    }
  }

  private static handleNotification(
    array: ChromeNotification[],
    title: string,
    message: string,
    contextMessage?: string
  ): ChromeNotification | undefined {
    if (array?.length === 1) {
      return array[0];
    } else if (array?.length) {
      return {
        type: 'list',
        title,
        message,
        contextMessage,
        iconUrl: 'assets/icons/icon-64.png',
        items: array.map(({ message: mMessage }, i) => ({ title: `${i}`, message: mMessage?.slice(0, 30) + '...' ?? '' })),
      };
    }
    return undefined;
  }

  private static sendOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      chrome.runtime.sendMessage({
        type: ChromeMessageType.notification,
        payload: notification,
      } as ChromeMessage);
    } else if (notification) {
      (notification.priority ?? 0 > NotificationLevel.info + 2 // because Chrome scale is -2 to 2
        ? this.error$
        : this.notify$
      ).next(notification);
    }
  }

  private static build(level: NotificationLevel, title: string, message: string, contextMessage?: string, iconUrl = 'assets/icons/icon-64.png') {
    return {
      priority: level - 2, // because Chrome scale is -2 to 2
      type: 'basic',
      title: `[${NotificationLevelKeys[level]}] : ${title}`,
      message,
      contextMessage,
      iconUrl,
    };
  }

  private static buildAndSend(
    level: NotificationLevel,
    title: string,
    message: string,
    contextMessage?: string,
    iconUrl = 'assets/icons/icon-64.png'
  ): void {
    this.sendOrForward(this.build(level, title, message, contextMessage, iconUrl));
  }

  static trace(title: string, message: string, contextMessage?: string, iconUrl?: string) {
    this.buildAndSend(NotificationLevel.trace, title, message, contextMessage, iconUrl);
  }

  static debug(title: string, message: string, contextMessage?: string, iconUrl?: string) {
    this.buildAndSend(NotificationLevel.debug, title, message, contextMessage, iconUrl);
  }

  static info(title: string, message: string, contextMessage?: string, iconUrl?: string) {
    this.buildAndSend(NotificationLevel.info, title, message, contextMessage, iconUrl);
  }

  static warn(title: string, message: string, contextMessage?: string, iconUrl?: string) {
    this.buildAndSend(NotificationLevel.warn, title, message, contextMessage, iconUrl);
  }

  static error(title: string, message: string, contextMessage?: string, iconUrl?: string) {
    this.buildAndSend(NotificationLevel.error, title, message, contextMessage, iconUrl);
  }

  static create(uri: string, source?: string, destination?: string): void {
    const parsed: ParsedQuery = parse(uri);
    const message = typeof parsed?.dn === 'string' ? parsed?.dn : parsed?.dn?.shift() ?? uri;

    // TODO Handle more than just magnet URL
    console.debug('parsed', parsed);

    this.info('Adding download task' + (destination ? ` to '${destination}'` : ''), message, source);
  }
}
