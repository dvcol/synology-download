/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call, ts/no-unsafe-return, ts/no-require-imports */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProxyLogger } from '../../utils/webex.utils';
import { BaseLoggerService } from './base-logger.service';
import { LoggerService } from './logger.service';

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
    store$: vi.fn(() => EMPTY),
  };
});
vi.mock('../../utils/webex.utils', () => ({
  ProxyLogger: { init: vi.fn(), reset: vi.fn() },
  useI18n: vi.fn(() => vi.fn((key: string) => key)),
  isMacOs: vi.fn(() => false),
}));
vi.mock('../../store/actions/state.action', () => ({
  addLogHistory: vi.fn(),
}));
vi.mock('../../store/selectors/settings.selector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../store/selectors/settings.selector')>();
  return {
    ...actual,
    getAdvancedSettingsLogging: vi.fn(),
  };
});
vi.mock('../../models/settings.model', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../models/settings.model')>();
  return {
    ...actual,
    defaultLoggingLevels: {},
    ServiceInstanceColorsMap: { ...actual.ServiceInstanceColorsMap, background: '#ff0000' },
  };
});

describe('logger.service', () => {
  const mockStore = {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
    // Suppress console output during tests
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'trace').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('init', () => {
    it('should call super.init with source and color from ServiceInstanceColorsMap', () => {
      const superInitSpy = vi.spyOn(BaseLoggerService, 'init');

      LoggerService.init({ source: 'background' as any, store: mockStore });

      expect(superInitSpy).toHaveBeenCalledWith({ source: 'background', color: '#ff0000' });
    });

    it('should call ProxyLogger.init with itself', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });

      expect(ProxyLogger.init).toHaveBeenCalledWith(LoggerService);
    });

    it('should set isProxy to false by default', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });

      // Verify isProxy is false by checking no sendMessage is used on log methods
      // This is implicitly tested through capture behavior
      expect((LoggerService as any).isProxy).toBe(false);
    });

    it('should set isProxy when provided', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore, isProxy: true });

      expect((LoggerService as any).isProxy).toBe(true);
    });
  });

  describe('destroy', () => {
    it('should call ProxyLogger.reset', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      vi.mocked(ProxyLogger.reset).mockClear();

      LoggerService.destroy();

      expect(ProxyLogger.reset).toHaveBeenCalled();
    });

    it('should restore the _destroy$ subject for subsequent init', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });

      LoggerService.destroy();

      // Should be able to init again without errors
      expect(() => LoggerService.init({ source: 'background' as any, store: mockStore })).not.toThrow();
    });
  });

  describe('trace', () => {
    it('should call super.trace', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      LoggerService.level = 0;
      const superSpy = vi.spyOn(BaseLoggerService, 'trace');

      LoggerService.trace('trace msg', 'extra');

      expect(superSpy).toHaveBeenCalledWith('trace msg', 'extra');
    });
  });

  describe('debug', () => {
    it('should call super.debug', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      LoggerService.level = 0;
      const superSpy = vi.spyOn(BaseLoggerService, 'debug');

      LoggerService.debug('debug msg');

      expect(superSpy).toHaveBeenCalledWith('debug msg');
    });
  });

  describe('info', () => {
    it('should call super.info', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      LoggerService.level = 0;
      const superSpy = vi.spyOn(BaseLoggerService, 'info');

      LoggerService.info('info msg');

      expect(superSpy).toHaveBeenCalledWith('info msg');
    });
  });

  describe('warn', () => {
    it('should call super.warn', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      LoggerService.level = 0;
      const superSpy = vi.spyOn(BaseLoggerService, 'warn');

      LoggerService.warn('warn msg');

      expect(superSpy).toHaveBeenCalledWith('warn msg');
    });
  });

  describe('error', () => {
    it('should call super.error', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      LoggerService.level = 0;
      const superSpy = vi.spyOn(BaseLoggerService, 'error');

      LoggerService.error('error msg');

      expect(superSpy).toHaveBeenCalledWith('error msg');
    });
  });

  describe('capture', () => {
    it('should not dispatch when history is disabled', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      (LoggerService as any).history = false;

      LoggerService.info('test');

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should not dispatch for levels below info', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore });
      (LoggerService as any).history = true;
      LoggerService.level = 0;

      LoggerService.debug('test');

      expect(mockStore.dispatch).not.toHaveBeenCalled();
    });

    it('should dispatch for info level and above when history is enabled and not proxy', () => {
      LoggerService.init({ source: 'background' as any, store: mockStore, isProxy: false });
      (LoggerService as any).history = true;
      LoggerService.level = 0;
      mockStore.dispatch.mockClear();

      LoggerService.info('test message');

      expect(mockStore.dispatch).toHaveBeenCalled();
    });

    it('should send message when proxy and history is enabled for info+', async () => {
      const { sendMessage } = await import('../../utils/chrome/chrome-message.utils');
      LoggerService.init({ source: 'background' as any, store: mockStore, isProxy: true });
      (LoggerService as any).history = true;
      LoggerService.level = 0;
      vi.mocked(sendMessage).mockClear();

      LoggerService.info('proxy test');

      expect(sendMessage).toHaveBeenCalled();
    });
  });
});
