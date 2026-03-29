/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call, ts/no-unsafe-argument, ts/no-unsafe-return, ts/no-require-imports */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationLevel, NotificationType } from '../../models/notification.model';
import { sendActiveTabMessage, sendMessage } from '../../utils/chrome/chrome-message.utils';
import { NotificationService } from './notification.service';

vi.mock('../../utils/webex.utils', () => ({
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  isMacOs: vi.fn(() => false),
}));
vi.mock('../../utils/chrome/chrome-message.utils', () => {
  const mockObservable = () => {
    const obs: any = { subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) };
    obs.pipe = vi.fn(() => obs);
    return obs;
  };
  return {
    onMessage: vi.fn(mockObservable),
    sendMessage: vi.fn(mockObservable),
    sendActiveTabMessage: vi.fn(mockObservable),
  };
});
vi.mock('../../utils/chrome/chrome.utils', () => ({
  createNotification: vi.fn(),
}));
vi.mock('../../utils/rxjs.utils', () => {
  const { EMPTY } = require('rxjs');
  return {
    bufferDebounceUnless: vi.fn(() => (source$: any) => source$),
    store$: vi.fn(() => EMPTY),
  };
});
vi.mock('../../utils/string.utils', () => ({
  parseMagnetLink: vi.fn((url: string) => url),
}));
vi.mock('../../store/actions/state.action', () => ({
  setBadge: vi.fn(),
}));
vi.mock('../../store/selectors/composite.selector', () => ({
  getNotificationsBannerEnabled: vi.fn(() => true),
  getNotificationsSnackEnabled: vi.fn(() => true),
  getStateBadge: vi.fn(),
}));
vi.mock('../../store/selectors/settings.selector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store/selectors/settings.selector')>();
  return {
    ...actual,
    getNotificationsBannerLevel: vi.fn(() => 0),
    getNotificationsSnack: vi.fn(() => ({ timeout: 3000, position: {} })),
    getNotificationsSnackLevel: vi.fn(() => 0),
  };
});
vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

describe('notification.service', () => {
  const mockStore = {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();

    // Re-mock after restoreAllMocks so sendMessage/sendActiveTabMessage stay mocked
    vi.mocked(sendMessage).mockReturnValue({ subscribe: vi.fn() } as any);
    vi.mocked(sendActiveTabMessage).mockReturnValue({ subscribe: vi.fn() } as any);
  });

  describe('init / destroy lifecycle', () => {
    it('should initialize without throwing', () => {
      expect(() => NotificationService.init(mockStore, 'background' as any)).not.toThrow();
    });

    it('should destroy without throwing', () => {
      NotificationService.init(mockStore, 'background' as any);
      expect(() => NotificationService.destroy()).not.toThrow();
    });

    it('should allow re-init after destroy', () => {
      NotificationService.init(mockStore, 'background' as any);
      NotificationService.destroy();
      expect(() => NotificationService.init(mockStore, 'background' as any)).not.toThrow();
    });

    it('should call destroy at the beginning of init', () => {
      const destroySpy = vi.spyOn(NotificationService, 'destroy');
      NotificationService.init(mockStore, 'background' as any);
      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('trace', () => {
    it('should call buildAndSend with trace priority', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const spy = vi.spyOn(NotificationService as any, 'buildAndSend');

      NotificationService.trace({ title: 'test trace' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test trace', priority: NotificationLevel.trace }),
        expect.objectContaining({ type: NotificationType.snack }),
      );
    });
  });

  describe('debug', () => {
    it('should call buildAndSend with debug priority', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const spy = vi.spyOn(NotificationService as any, 'buildAndSend');

      NotificationService.debug({ title: 'test debug' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test debug', priority: NotificationLevel.debug }),
        expect.objectContaining({ type: NotificationType.snack }),
      );
    });
  });

  describe('info', () => {
    it('should call buildAndSend with info priority', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const spy = vi.spyOn(NotificationService as any, 'buildAndSend');

      NotificationService.info({ title: 'test info' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test info', priority: NotificationLevel.info }),
        expect.objectContaining({ type: NotificationType.snack }),
      );
    });
  });

  describe('warn', () => {
    it('should call buildAndSend with warn priority', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const spy = vi.spyOn(NotificationService as any, 'buildAndSend');

      NotificationService.warn({ title: 'test warn' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test warn', priority: NotificationLevel.warn }),
        expect.objectContaining({ type: NotificationType.snack }),
      );
    });
  });

  describe('error', () => {
    it('should call buildAndSend with error priority', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const spy = vi.spyOn(NotificationService as any, 'buildAndSend');

      NotificationService.error({ title: 'test error' });

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'test error', priority: NotificationLevel.error }),
        expect.objectContaining({ type: NotificationType.snack }),
      );
    });
  });

  describe('taskCreated', () => {
    it('should call info with task_created title and url in message', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      NotificationService.taskCreated('http://example.com/file.torrent');

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'task_created',
          success: true,
        }),
      );
      // message should contain the URL
      const call = infoSpy.mock.calls[0][0];
      expect(call.message).toContain('http://example.com/file.torrent');
    });

    it('should handle array of urls', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      NotificationService.taskCreated(['url1', 'url2']);

      expect(infoSpy).toHaveBeenCalledTimes(1);
      const call = infoSpy.mock.calls[0][0];
      expect(call.message).toContain('url1');
      expect(call.message).toContain('url2');
    });

    it('should include destination folder when provided', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      NotificationService.taskCreated('url1', undefined, '/shared/folder');

      const call = infoSpy.mock.calls[0][0];
      expect(call.message).toContain('/shared/folder');
    });

    it('should set contextMessage to source when provided', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      NotificationService.taskCreated('url1', 'my-source');

      const call = infoSpy.mock.calls[0][0];
      expect(call.contextMessage).toBe('my-source');
    });
  });

  describe('taskFinished', () => {
    it('should call info with banner type', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      const task = { id: 'task-1', title: 'My Task', additional: { detail: { destination: '/dest' } } } as any;
      NotificationService.taskFinished(task);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'task_finished' }),
        expect.objectContaining({ type: NotificationType.banner }),
      );
    });

    it('should include destination in contextMessage when available', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      const task = { id: 'task-1', title: 'My Task', additional: { detail: { destination: '/dest' } } } as any;
      NotificationService.taskFinished(task);

      const call = infoSpy.mock.calls[0][0];
      expect(call.contextMessage).toContain('/dest');
    });
  });

  describe('taskError', () => {
    it('should call error with banner type', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const errorSpy = vi.spyOn(NotificationService, 'error');

      const task = { id: 'task-1', title: 'Failed Task', status_extra: {} } as any;
      NotificationService.taskError(task);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'task_error' }),
        expect.objectContaining({ type: NotificationType.banner }),
      );
    });

    it('should include error detail in contextMessage when available', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const errorSpy = vi.spyOn(NotificationService, 'error');

      const task = { id: 'task-1', title: 'Failed Task', status_extra: { error_detail: 'disk_full' } } as any;
      NotificationService.taskError(task);

      const call = errorSpy.mock.calls[0][0];
      expect(call.contextMessage).toContain('disk_full');
    });
  });

  describe('loginRequired', () => {
    it('should call error with login titles', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const errorSpy = vi.spyOn(NotificationService, 'error');

      NotificationService.loginRequired();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'login_required',
          message: 'please_login',
        }),
      );
    });
  });

  describe('downloadCreated', () => {
    it('should call info with download_created title', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      const download = { title: 'file.zip', folder: '/downloads', referrer: 'http://example.com' } as any;
      NotificationService.downloadCreated(download);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'download_created',
          success: true,
        }),
      );
      const call = infoSpy.mock.calls[0][0];
      expect(call.message).toContain('file.zip');
      expect(call.contextMessage).toBe('http://example.com');
    });
  });

  describe('downloadError', () => {
    it('should call error with banner type', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const errorSpy = vi.spyOn(NotificationService, 'error');

      const download = { title: 'broken.zip', error: 'network_error' } as any;
      NotificationService.downloadError(download);

      expect(errorSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'download_error' }),
        expect.objectContaining({ type: NotificationType.banner }),
      );
      const call = errorSpy.mock.calls[0][0];
      expect(call.message).toContain('broken.zip');
      expect(call.contextMessage).toContain('network_error');
    });
  });

  describe('downloadFinished', () => {
    it('should call info with banner type', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      const infoSpy = vi.spyOn(NotificationService, 'info');

      const download = { title: 'done.zip', folder: '/complete' } as any;
      NotificationService.downloadFinished(download);

      expect(infoSpy).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'download_finished' }),
        expect.objectContaining({ type: NotificationType.banner }),
      );
      const call = infoSpy.mock.calls[0][0];
      expect(call.message).toContain('done.zip');
      expect(call.contextMessage).toContain('/complete');
    });
  });

  describe('sendBannerOrForward', () => {
    it('should send message when in proxy mode', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      vi.mocked(sendMessage).mockClear();

      (NotificationService as any).sendBannerOrForward({
        type: 'basic',
        title: 'Test',
        message: 'msg',
        priority: NotificationLevel.info,
      });

      expect(sendMessage).toHaveBeenCalled();
    });

    it('should not send message when not in proxy mode', () => {
      NotificationService.init(mockStore, 'background' as any, false);
      vi.mocked(sendMessage).mockClear();

      (NotificationService as any).sendBannerOrForward({
        type: 'basic',
        title: 'Test',
        message: 'msg',
        priority: NotificationLevel.info,
      });

      expect(sendMessage).not.toHaveBeenCalled();
    });

    it('should do nothing when notification is undefined', () => {
      NotificationService.init(mockStore, 'background' as any, true);
      vi.mocked(sendMessage).mockClear();

      (NotificationService as any).sendBannerOrForward(undefined);

      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('sendSnackOrForward', () => {
    it('should emit on snack$ when in proxy mode', () => {
      NotificationService.init(mockStore, 'background' as any, true);

      // Should not throw
      expect(() => {
        (NotificationService as any).sendSnackOrForward({
          message: { title: 'test', priority: NotificationLevel.info },
        });
      }).not.toThrow();
    });

    it('should send active tab message when not in proxy mode', () => {
      NotificationService.init(mockStore, 'background' as any, false);
      vi.mocked(sendActiveTabMessage).mockClear();

      (NotificationService as any).sendSnackOrForward({
        message: { title: 'test', priority: NotificationLevel.info },
      });

      expect(sendActiveTabMessage).toHaveBeenCalled();
    });

    it('should do nothing when notification is undefined', () => {
      NotificationService.init(mockStore, 'background' as any, false);
      vi.mocked(sendActiveTabMessage).mockClear();

      (NotificationService as any).sendSnackOrForward(undefined);

      expect(sendActiveTabMessage).not.toHaveBeenCalled();
    });
  });
});
