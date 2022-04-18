import { filter, map, Subject, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type { ChromeNotification, SnackMessage, SnackNotification, StoreOrProxy, Task } from '@src/models';
import { ChromeMessageType, NotificationLevel, NotificationLevelKeys, NotificationType } from '@src/models';
import { store$ } from '@src/store';
import { setTasksCount } from '@src/store/actions';
import {
  getCount,
  getNotificationsBannerEnabled,
  getNotificationsBannerLevel,
  getNotificationsSnack,
  getNotificationsSnackEnabled,
  getNotificationsSnackLevel,
} from '@src/store/selectors';
import { bufferDebounceUnless, createNotification, onMessage, parseMagnetLink, sendMessage } from '@src/utils';

import type { VariantType } from 'notistack';
import type { Observable } from 'rxjs';

// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = useI18n('common', 'notification');

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
        map(n => this.handleBannerNotification(n, title, message)),
        tap(n => n && createNotification(n)),
      );

  static init(store: StoreOrProxy, isProxy = false): void {
    this.store = store;
    this.isProxy = isProxy;

    if (!isProxy) {
      this.notify$.pipe(this.bufferStopStart('Notification')).subscribe();
      this.error$.pipe(this.bufferStopStart('Errors')).subscribe();

      store$(this.store, getCount).subscribe(count => this.store.dispatch(setTasksCount(count)));

      onMessage<ChromeNotification>([ChromeMessageType.notification]).subscribe(({ message: { payload }, sendResponse }) => {
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
      map(n => this.handleSnackNotification(n)),
    );
  }

  private static handleBannerNotification(
    array: ChromeNotification[],
    listTitle: string,
    listMessage?: string,
    listContextMessage?: string,
  ): ChromeNotification | undefined {
    if (array?.length === 1) {
      const { type, title, message, contextMessage, priority } = array[0];
      return { type, title, message, contextMessage, priority, iconUrl: 'assets/icons/icon-64.png' };
    }
    if (array?.length) {
      return {
        type: 'list',
        title: Array.from(new Set(array?.map(({ title }) => title))).join(', ') ?? listTitle,
        message: listMessage ?? '',
        contextMessage: listContextMessage,
        iconUrl: 'assets/icons/icon-64.png',
        items: array.map(({ message: mMessage }, i) => ({
          title: `${i}`,
          message: `${mMessage?.slice(0, 30)}...` ?? '',
        })),
      };
    }
    return undefined;
  }

  private static handleSnackNotification(
    message: SnackMessage,
    { timeout: autoHideDuration, position: anchorOrigin } = getNotificationsSnack(this.store.getState()),
  ): SnackNotification {
    let variant: VariantType = 'default';
    if (message?.priority === NotificationLevel.info) {
      variant = message?.success ? 'success' : 'info';
    } else if (message?.priority === NotificationLevel.warn) {
      variant = 'warning';
    } else if (message?.priority === NotificationLevel.error) {
      variant = 'error';
    }
    return {
      message,
      options: { autoHideDuration, anchorOrigin, variant, preventDuplicate: true, disableWindowBlurListener: true },
    };
  }

  private static sendOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      sendMessage<ChromeNotification>({ type: ChromeMessageType.notification, payload: notification }).subscribe();
    } else if (notification) {
      (notification.priority ?? NotificationLevel.info < 0 ? this.error$ : this.notify$).next(notification);
    }
  }

  private static buildAndSend(notification: SnackMessage, type: NotificationType): void {
    if (type === NotificationType.snack) {
      this.snack$.next(notification);
    } else {
      this.sendOrForward({
        ...notification,
        message: notification?.message ?? '',
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
    this.info({
      title: i18n('task_created'),
      message: [`${i18n('title')}\xa0${parseMagnetLink(uri)}`, destination ? `${i18n('destination_folder')}\xa0${destination}` : ''].join('\n'),
      contextMessage: source,
      success: true,
    });
  }

  static taskFinished(task: Task) {
    this.info(
      {
        title: i18n('task_finished'),
        message: `${i18n('title')}\xa0${parseMagnetLink(task?.title) ?? task.id}`,
        contextMessage: task.additional.detail.destination ? `${i18n('destination_folder')}\xa0${task.additional.detail.destination}` : undefined,
      },
      NotificationType.banner,
    );
  }

  static taskError(task: Task) {
    this.error(
      {
        title: i18n('task_error'),
        message: `${i18n('title')}\xa0${parseMagnetLink(task?.title) ?? task.id}`,
        contextMessage: task.status_extra?.error_detail ? `${i18n('error_message')}\xa0${task.status_extra.error_detail}` : undefined,
      },
      NotificationType.banner,
    );
  }

  static loginRequired() {
    this.error({
      title: i18n('login_required', 'common', 'error'),
      message: i18n('please_login', 'common', 'error'),
    });
  }
}
