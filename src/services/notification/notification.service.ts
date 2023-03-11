import { filter, map, Subject, tap } from 'rxjs';

import { useI18n } from '@dvcol/web-extension-utils';

import type {
  ChromeNotification,
  Download,
  NotificationServiceOptions,
  ServiceInstance,
  SnackMessage,
  SnackNotification,
  StateSlice,
  StoreOrProxy,
  Task,
} from '@src/models';
import { ChromeMessageType, NotificationLevel, NotificationLevelKeys, NotificationType } from '@src/models';
import { LoggerService } from '@src/services';
import { setBadge } from '@src/store/actions';
import {
  getNotificationsBannerEnabled,
  getNotificationsBannerLevel,
  getNotificationsSnack,
  getNotificationsSnackEnabled,
  getNotificationsSnackLevel,
  getStateBadge,
} from '@src/store/selectors';
import { bufferDebounceUnless, createNotification, isMacOs, onMessage, parseMagnetLink, sendActiveTabMessage, sendMessage, store$ } from '@src/utils';

import type { VariantType } from 'notistack';
import type { Observable } from 'rxjs';

// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = useI18n('common', 'notification');

export class NotificationService {
  private static source: ServiceInstance;
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

  static init(store: StoreOrProxy, source: ServiceInstance, isProxy = false): void {
    this.store = store;
    this.source = source;
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

    LoggerService.debug('Notification service initialized', { isProxy });
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
    if (!array?.length) return;
    if (array?.length === 1) {
      const { type, title, message, contextMessage, priority } = array[0];
      return { type, title, message, contextMessage, priority, iconUrl: 'assets/icons/icon-64.png' };
    }

    return {
      type: 'list',
      title: listTitle,
      message: listMessage ?? '',
      contextMessage: isMacOs() ? `${array?.length} new notifications` : listContextMessage,
      iconUrl: 'assets/icons/icon-64.png',
      items: array.map(({ message: mMessage, title: mTitle }) => ({
        title: mTitle,
        message: `${mMessage?.slice(0, 30)}...` ?? '',
      })),
    };
  }

  private static handleSnackNotification(
    { message, options }: SnackNotification,
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
      options: {
        autoHideDuration,
        anchorOrigin,
        variant,
        preventDuplicate: true,
        disableWindowBlurListener: true,
        ...options,
      },
    };
  }

  private static sendBannerOrForward(notification?: ChromeNotification) {
    if (notification && this.isProxy) {
      sendMessage<ChromeNotification>({
        type: ChromeMessageType.notificationBanner,
        payload: notification,
      }).subscribe({
        error: e => LoggerService.warn('Banner notification failed, forward ended in error.', e),
      });
    } else if (notification) {
      (notification.priority ?? NotificationLevel.info < 0 ? this.error$ : this.notify$).next(notification);
    }
  }

  private static sendSnackOrForward(notification?: SnackNotification) {
    if (notification && this.isProxy) {
      this.snack$.next(notification);
    } else if (notification?.message) {
      sendActiveTabMessage<SnackNotification>({
        type: ChromeMessageType.notificationSnack,
        payload: notification,
      }).subscribe({
        error: e => LoggerService.warn('Snack notification failed, no active tab found.', e),
      });
    }
  }

  private static buildAndSend(notification: SnackMessage, { type, options }: NotificationServiceOptions): void {
    if (type === NotificationType.snack) {
      this.sendSnackOrForward({ message: notification, options });
    } else {
      this.sendBannerOrForward({
        ...notification,
        message: notification?.message ?? '',
        title: `${notification.priority ? NotificationLevelKeys[notification.priority] : 'Info'} - ${notification.title}`,
        iconUrl: 'assets/icons/icon-64.png',
        type: 'basic',
      });
    }
  }

  static trace(notification: SnackMessage, options: NotificationServiceOptions = {}) {
    this.buildAndSend(
      {
        ...notification,
        priority: NotificationLevel.trace,
      },
      { type: NotificationType.snack, ...options },
    );
  }

  static debug(notification: SnackMessage, options: NotificationServiceOptions = {}) {
    this.buildAndSend(
      {
        ...notification,
        priority: NotificationLevel.debug,
      },
      { type: NotificationType.snack, ...options },
    );
  }

  static info(notification: SnackMessage, options: NotificationServiceOptions = {}) {
    this.buildAndSend(
      {
        ...notification,
        priority: NotificationLevel.info,
      },
      { type: NotificationType.snack, ...options },
    );
  }

  static warn(notification: SnackMessage, options: NotificationServiceOptions = {}) {
    this.buildAndSend(
      {
        ...notification,
        priority: NotificationLevel.warn,
      },
      { type: NotificationType.snack, ...options },
    );
  }

  static error(notification: SnackMessage, options: NotificationServiceOptions = {}) {
    this.buildAndSend(
      {
        ...notification,
        priority: NotificationLevel.error,
      },
      { type: NotificationType.snack, ...options },
    );
  }

  static taskCreated(url: string | string[], source?: string, destination?: string): void {
    const _url: string[] = (Array.isArray(url) ? url : [url]) ?? [];
    this.info({
      title: i18n('task_created'),
      message: [
        ..._url.map(uri => `${i18n('title')}\xa0${parseMagnetLink(uri)}`),
        destination ? `${i18n('destination_folder')}\xa0${destination}` : '',
      ].join('\n'),
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
