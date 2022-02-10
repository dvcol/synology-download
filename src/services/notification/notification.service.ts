import { filter, map, Observable, Subject, tap } from 'rxjs';
import {
  getCount,
  getNotificationsBannerEnabled,
  getNotificationsBannerLevel,
  getNotificationsSnack,
  getNotificationsSnackEnabled,
  getNotificationsSnackLevel,
} from '@src/store/selectors';
import { setTasksCount } from '@src/store/actions';
import { store$ } from '@src/store';
import { bufferDebounceUnless, onMessage, parseMagnetLink, sendMessage } from '@src/utils';
import {
  ChromeMessageType,
  ChromeNotification,
  NotificationLevel,
  NotificationLevelKeys,
  NotificationType,
  SnackMessage,
  SnackNotification,
  StoreOrProxy,
  Task,
} from '@src/models';
import { VariantType } from 'notistack';

// TODO use Mui Snackbar to do in popup & in context notifications
export class NotificationService {
  private static store: any | StoreOrProxy;
  private static isProxy: boolean;

  private static readonly notify$ = new Subject<ChromeNotification>();
  private static readonly error$ = new Subject<ChromeNotification>();

  private static readonly snack$ = new Subject<SnackMessage>();

  private static bufferStopStart =
    (title: string, message?: string) =>
    (source$: Observable<ChromeNotification>): Observable<ChromeNotification | undefined> =>
      source$.pipe(
        filter(({ priority }) => {
          const enabled = getNotificationsBannerEnabled(this.store.getState());
          const level = getNotificationsBannerLevel(this.store.getState());
          return enabled && Number(priority) >= level;
        }),
        bufferDebounceUnless(200, 10),
        map((n) => this.handleBannerNotification(n, title, message)),
        tap((n) => n && chrome.notifications.create(n))
      );

  static init(store: StoreOrProxy, isProxy = false): void {
    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) {
      this.notify$.pipe(this.bufferStopStart('Notification')).subscribe();
      this.error$.pipe(this.bufferStopStart('Errors')).subscribe();

      store$(this.store, getCount).subscribe((count) => this.store.dispatch(setTasksCount(count)));

      onMessage<ChromeNotification>([ChromeMessageType.notification], true).subscribe(({ message: { payload }, sendResponse }) => {
        this.sendOrForward(payload);
        sendResponse();
      });
    }
  }

  static get snackNotifications$(): Observable<SnackNotification> {
    return this.snack$.pipe(
      filter(({ priority }) => {
        const enabled = getNotificationsSnackEnabled(this.store.getState());
        const level = getNotificationsSnackLevel(this.store.getState());
        return enabled && Number(priority) >= level;
      }),
      map((n) => this.handleSnackNotification(n))
    );
  }

  private static handleBannerNotification(
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

  private static handleSnackNotification(
    message: SnackMessage,
    { timeout: autoHideDuration, position: anchorOrigin } = getNotificationsSnack(this.store.getState())
  ): SnackNotification {
    let variant: VariantType = 'default';
    if (message?.priority === NotificationLevel.info) {
      variant = message?.success ? 'success' : 'info';
    } else if (message?.priority === NotificationLevel.warn) {
      variant = 'warning';
    } else if (message?.priority === NotificationLevel.error) {
      variant = 'error';
    }
    return { message, options: { autoHideDuration, anchorOrigin, variant, preventDuplicate: true, disableWindowBlurListener: true } };
  }

  private static sendOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      sendMessage<ChromeNotification>({ type: ChromeMessageType.notification, payload: notification }).subscribe();
    } else if (notification) {
      (notification.priority ?? 0 > NotificationLevel.info ? this.error$ : this.notify$).next(notification);
    }
  }

  private static buildAndSend(notification: SnackMessage, type: NotificationType): void {
    if (type === NotificationType.snack) {
      this.snack$.next(notification);
    } else {
      this.sendOrForward({
        ...notification,
        title: `[${notification.priority ? NotificationLevelKeys[notification.priority] : 'Info'}] : ${notification.title}`,
        iconUrl: 'assets/icons/icon-64.png',
        type: 'basic',
      });
    }
  }

  static trace(notification: SnackMessage, type: NotificationType = NotificationType.snack) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.trace }, type);
  }

  static debug(notification: SnackMessage, type: NotificationType = NotificationType.snack) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.debug }, type);
  }

  static info(notification: SnackMessage, type: NotificationType = NotificationType.snack) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.info }, type);
  }

  static warn(notification: SnackMessage, type: NotificationType = NotificationType.snack) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.warn }, type);
  }

  static error(notification: SnackMessage, type: NotificationType = NotificationType.snack) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.error }, type);
  }

  static taskCreated(uri: string, source?: string, destination?: string): void {
    // TODO display error & delete/pause button after creation ?
    this.info({
      title: 'Task created successfully.',
      message: `Title:\xa0${parseMagnetLink(uri)}${destination ? '\nDestination folder: ' + destination : ''}`,
      contextMessage: source,
      success: true,
    });
  }

  static taskFinished(task: Task) {
    this.info(
      {
        title: 'Task created successfully.',
        message: `Title:\xa0${parseMagnetLink(task?.title) ?? task.id}`,
        contextMessage: task.additional.detail.destination ? `Destination folder:\xa0${task.additional.detail.destination}` : undefined,
      },
      NotificationType.banner
    );
  }

  static taskError(task: Task) {
    this.error(
      {
        title: 'Task Failed.',
        message: `Title:\xa0${parseMagnetLink(task?.title) ?? task.id}`,
        contextMessage: task.status_extra?.error_detail ? `Error message:\xa0${task.status_extra.error_detail}` : undefined,
      },
      NotificationType.banner
    );
  }
}
