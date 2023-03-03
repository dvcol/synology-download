import { filter, map, Subject, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type {
  ChromeNotification,
  Download,
  NotificationServiceOptions,
  SnackMessage,
  SnackNotification,
  StateSlice,
  StoreOrProxy,
  Task,
} from '@src/models';
import { ChromeMessageType, NotificationLevel, NotificationLevelKeys, NotificationType } from '@src/models';
import { store$ } from '@src/store';
import { setBadge } from '@src/store/actions';
import {
  getNotificationsBannerEnabled,
  getNotificationsBannerLevel,
  getNotificationsSnack,
  getNotificationsSnackEnabled,
  getNotificationsSnackLevel,
  getStateBadge,
} from '@src/store/selectors';
import { bufferDebounceUnless, createNotification, onMessage, parseMagnetLink, sendActiveTabMessage, sendMessage } from '@src/utils';

import type { VariantType } from 'notistack';
import type { Observable } from 'rxjs';

// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = useI18n('common', 'notification');

export class NotificationService {
  private static store: any | StoreOrProxy;

  private static isProxy: boolean;

  private static readonly notify$ = new Subject<ChromeNotification>();

  private static readonly error$ = new Subject<ChromeNotification>();

  private static readonly snack$ = new Subject<SnackNotification>();

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

      store$<StateSlice['badge']>(this.store, getStateBadge).subscribe(count => this.store.dispatch(setBadge(count)));

      onMessage<ChromeNotification>([ChromeMessageType.notificationBanner]).subscribe(({ message: { payload }, sendResponse }) => {
        this.sendBannerOrForward(payload);
        sendResponse();
      });
    } else {
      onMessage<SnackNotification>([ChromeMessageType.notificationSnack]).subscribe(({ message: { payload }, sendResponse }) => {
        this.sendSnackOrForward(payload);
        sendResponse();
      });
    }
  }

  static get snackNotifications$(): Observable<SnackNotification> {
    return this.snack$.pipe(
      filter(({ message }) => {
        const enabled = getNotificationsSnackEnabled(this.store.getState());
        const level = getNotificationsSnackLevel(this.store.getState());
        return enabled && Number(message.priority) >= level;
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
    { message }: SnackNotification,
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

  private static sendBannerOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      sendMessage<ChromeNotification>({ type: ChromeMessageType.notificationBanner, payload: notification }).subscribe({
        error: e => console.warn('Snack notification failed, no active tab found.', e),
      });
    } else if (notification) {
      (notification.priority ?? NotificationLevel.info < 0 ? this.error$ : this.notify$).next(notification);
    }
  }

  private static sendSnackOrForward(notification?: SnackNotification) {
    if (notification && this.isProxy) {
      this.snack$.next(notification);
    } else if (notification?.message) {
      sendActiveTabMessage<SnackNotification>({ type: ChromeMessageType.notificationSnack, payload: notification }).subscribe();
    }
  }

  private static buildAndSend(notification: SnackMessage, { type, options }: NotificationServiceOptions): void {
    if (type === NotificationType.snack) {
      this.sendSnackOrForward({ message: notification, options });
    } else {
      this.sendBannerOrForward({
        ...notification,
        message: notification?.message ?? '',
        title: `[${notification.priority ? NotificationLevelKeys[notification.priority] : 'Info'}] : ${notification.title}`,
        iconUrl: 'assets/icons/icon-64.png',
        type: 'basic',
      });
    }
  }

  static trace(notification: SnackMessage, options: NotificationServiceOptions = { type: NotificationType.snack }) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.trace }, options);
  }

  static debug(notification: SnackMessage, options: NotificationServiceOptions = { type: NotificationType.snack }) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.debug }, options);
  }

  static info(notification: SnackMessage, options: NotificationServiceOptions = { type: NotificationType.snack }) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.info }, options);
  }

  static warn(notification: SnackMessage, options: NotificationServiceOptions = { type: NotificationType.snack }) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.warn }, options);
  }

  static error(notification: SnackMessage, options: NotificationServiceOptions = { type: NotificationType.snack }) {
    this.buildAndSend({ ...notification, priority: NotificationLevel.error }, options);
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
      { type: NotificationType.banner },
    );
  }

  static taskError(task: Task) {
    this.error(
      {
        title: i18n('task_error'),
        message: `${i18n('title')}\xa0${parseMagnetLink(task?.title) ?? task.id}`,
        contextMessage: task.status_extra?.error_detail
          ? `${i18n('error_message')}\xa0${i18n(task.status_extra.error_detail, 'common', 'model', 'task_error')}`
          : undefined,
      },
      { type: NotificationType.banner },
    );
  }

  static loginRequired() {
    this.error({
      title: i18n('login_required', 'common', 'error'),
      message: i18n('please_login', 'common', 'error'),
    });
  }

  static downloadCreated(download: Download): void {
    this.info({
      title: i18n('download_created'),
      message: [`${i18n('title')}\xa0${download.title}`, download?.folder ? `${i18n('destination_folder')}\xa0${download?.folder}` : ''].join('\n'),
      contextMessage: download?.referrer,
      success: true,
    });
  }

  static downloadError(download: Download): void {
    this.error(
      {
        title: i18n('download_error'),
        message: `${i18n('title')}\xa0${download.title}`,
        contextMessage: download.error ? `${i18n('error_message')}\xa0${i18n(download.error, 'common', 'model', 'download_error')}` : undefined,
      },
      { type: NotificationType.banner },
    );
  }

  static downloadFinished(download: Download): void {
    this.info(
      {
        title: i18n('download_finished'),
        message: `${i18n('title')}\xa0${download.title}`,
        contextMessage: download.folder ? `${i18n('destination_folder')}\xa0${download.folder}` : undefined,
      },
      { type: NotificationType.banner },
    );
  }
}
