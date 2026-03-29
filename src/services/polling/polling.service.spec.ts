/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-argument, ts/no-unsafe-return, ts/no-require-imports */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChromeMessageType } from '../../models/message.model';
import { sendMessage } from '../../utils/chrome/chrome-message.utils';
import { LoggerService } from '../logger/logger.service';
import { PollingService } from './polling.service';

vi.mock('../../models/settings.model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../models/settings.model')>();
  return {
    ...actual,
    defaultPolling: { background: { interval: 5000 } },
  };
});
vi.mock('../../store/selectors/composite.selector', () => ({
  getPollingEnabled: vi.fn(() => true),
  getPollingInterval: vi.fn(() => 5000),
}));
vi.mock('../../store/selectors/settings.selector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store/selectors/settings.selector')>();
  return {
    ...actual,
    getSettingsDownloadsEnabled: vi.fn(() => false),
  };
});
vi.mock('../../store/selectors/state.selector', () => ({
  getLogged: vi.fn(() => false),
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
  };
});
vi.mock('../../utils/rxjs.utils', () => {
  const { EMPTY } = require('rxjs');
  return {
    skipUntilRepeat: vi.fn(() => (source$: any) => source$),
    store$: vi.fn(() => EMPTY),
  };
});
vi.mock('../download/download.service', () => ({
  DownloadService: { searchAll: vi.fn(() => ({ pipe: vi.fn(() => ({ subscribe: vi.fn() })) })) },
}));
vi.mock('../logger/logger.service', () => ({
  LoggerService: { debug: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));
vi.mock('../query/query.service', () => ({
  QueryService: { isLoggedIn: false, listTasks: vi.fn(), getStatistic: vi.fn(), init: vi.fn(), destroy: vi.fn() },
}));

describe('polling.service', () => {
  const mockStore = {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Re-mock sendMessage after restoreAllMocks
    vi.mocked(sendMessage).mockReturnValue({ subscribe: vi.fn() } as any);
  });

  describe('init / destroy lifecycle', () => {
    it('should initialize without throwing', () => {
      expect(() => PollingService.init(mockStore)).not.toThrow();
    });

    it('should destroy without throwing', () => {
      PollingService.init(mockStore);
      expect(() => PollingService.destroy()).not.toThrow();
    });

    it('should allow re-init after destroy', () => {
      PollingService.init(mockStore);
      PollingService.destroy();
      expect(() => PollingService.init(mockStore)).not.toThrow();
    });

    it('should call destroy at the beginning of init', () => {
      const destroySpy = vi.spyOn(PollingService, 'destroy');
      PollingService.init(mockStore);
      expect(destroySpy).toHaveBeenCalled();
    });

    it('should log initialization message', () => {
      PollingService.init(mockStore);
      expect(LoggerService.debug).toHaveBeenCalledWith('Polling service initialized', { isProxy: false });
    });

    it('should log destruction message', () => {
      PollingService.init(mockStore);
      vi.mocked(LoggerService.debug).mockClear();

      PollingService.destroy();

      expect(LoggerService.debug).toHaveBeenCalledWith('Polling service destroyed');
    });
  });

  describe('init with proxy mode', () => {
    it('should set isProxy to true', () => {
      PollingService.init(mockStore, true);
      expect((PollingService as any).isProxy).toBe(true);
    });

    it('should set isProxy to false by default', () => {
      PollingService.init(mockStore);
      expect((PollingService as any).isProxy).toBe(false);
    });
  });

  describe('start', () => {
    it('should call sendMessage with polling type and true payload in proxy mode', () => {
      PollingService.init(mockStore, true);
      vi.mocked(sendMessage).mockClear();

      PollingService.start();

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ChromeMessageType.polling,
          payload: true,
        }),
      );
    });

    it('should not call sendMessage in non-proxy mode', () => {
      PollingService.init(mockStore, false);
      vi.mocked(sendMessage).mockClear();

      PollingService.start();

      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should call sendMessage with polling type and false payload in proxy mode', () => {
      PollingService.init(mockStore, true);
      vi.mocked(sendMessage).mockClear();

      PollingService.stop();

      expect(sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ChromeMessageType.polling,
          payload: false,
        }),
      );
    });

    it('should not call sendMessage in non-proxy mode', () => {
      PollingService.init(mockStore, false);
      vi.mocked(sendMessage).mockClear();

      PollingService.stop();

      expect(sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('change', () => {
    it('should emit on change$ subject without throwing', () => {
      PollingService.init(mockStore);
      expect(() => PollingService.change(10000)).not.toThrow();
    });

    it('should accept different interval values', () => {
      PollingService.init(mockStore);
      expect(() => PollingService.change(1000)).not.toThrow();
      expect(() => PollingService.change(30000)).not.toThrow();
    });
  });

  describe('timer$', () => {
    it('should be an observable', () => {
      expect(PollingService.timer$).toBeDefined();
      expect(PollingService.timer$.subscribe).toBeDefined();
    });
  });
});
