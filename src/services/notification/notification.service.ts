import { parse, ParsedQuery } from 'query-string';
import { filter, map, Observable, Subject, tap } from 'rxjs';
import { Store } from 'redux';
import { Store as ProxyStore } from 'webext-redux';
import { getNotificationsBannerLevel, getNotificationsEnabled, getTasksCount, setTasksCount, store$ } from '../../store';
import { bufferDebounceUnless, onMessage, sendMessage, skipUntilRepeat } from '../../utils';
import { ChromeMessageType, ChromeNotification, NotificationLevel, NotificationLevelKeys } from '../../models';

// TODO use Mui Snackbar to do in popup & in context notifications
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
    (title: string, message?: string) =>
    (source$: Observable<ChromeNotification>): Observable<ChromeNotification | undefined> =>
      source$.pipe(
        filter(({ priority }) => Number(priority) >= this.level),
        bufferDebounceUnless(200, 10),
        skipUntilRepeat(() => !this.enabled, this.stop$, this.start$),
        map((n) => this.handleNotification(n, title, message)),
        tap((n) => n && chrome.notifications.create(n))
      );

  static init(store: Store | ProxyStore, isProxy = false): void {
    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) {
      this.notify$.pipe(this.bufferStopStart('Notification')).subscribe();
      this.error$.pipe(this.bufferStopStart('Errors')).subscribe();

      store$(this.store, getTasksCount).subscribe((count) => this.store.dispatch(setTasksCount(count)));

      onMessage<ChromeNotification>([ChromeMessageType.notification]).subscribe(({ message: { payload } }) => this.sendOrForward(payload));
    }
  }

  private static handleNotification(
    array: ChromeNotification[],
    title: string,
    message?: string,
    contextMessage?: string
  ): ChromeNotification | undefined {
    if (array?.length === 1) {
      return array[0];
    } else if (array?.length) {
      return {
        type: 'list',
        title: Array.from(new Set(array?.map(({ title: t }) => t))).join(', ') ?? title,
        message: message ?? '',
        contextMessage,
        iconUrl: 'assets/icons/icon-64.png',
        items: array.map(({ message: mMessage }, i) => ({ title: `${i}`, message: mMessage?.slice(0, 30) + '...' ?? '' })),
      };
    }
    return undefined;
  }

  private static sendOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      sendMessage<ChromeNotification>({ type: ChromeMessageType.notification, payload: notification }).subscribe();
    } else if (notification) {
      (notification.priority ?? 0 > NotificationLevel.info ? this.error$ : this.notify$).next(notification);
    }
  }

  private static buildAndSend(
    priority: NotificationLevel,
    title: string,
    message: string,
    contextMessage?: string,
    iconUrl = 'assets/icons/icon-64.png'
  ): void {
    this.sendOrForward({
      priority,
      type: 'basic',
      title: `[${NotificationLevelKeys[priority]}] : ${title}`,
      message,
      contextMessage,
      iconUrl,
    });
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
