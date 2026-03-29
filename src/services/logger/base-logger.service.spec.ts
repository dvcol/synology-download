/* eslint-disable ts/no-unsafe-member-access, ts/no-unsafe-assignment, ts/no-unsafe-call */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LoggingLevel } from '../../models/logger.model';
import { BaseLoggerService } from './base-logger.service';

describe('base-logger.service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    BaseLoggerService.level = 4;
    BaseLoggerService.enabled = true;
  });

  describe('init', () => {
    it('should set source and color', () => {
      BaseLoggerService.init({ source: 'test-source', color: '#ff0000' });

      // Verify via timestamp getter which exposes source and color
      const ts = BaseLoggerService.timestamp;
      expect(ts[0]).toContain('test-source');
      expect(ts[2]).toContain('#ff0000');
    });

    it('should use default color when none provided', () => {
      BaseLoggerService.init({ source: 'test-source' });

      const ts = BaseLoggerService.timestamp;
      expect(ts[2]).toContain('#96c4ff');
    });
  });

  describe('timestamp', () => {
    it('should return a formatted timestamp array with 4 elements', () => {
      BaseLoggerService.init({ source: 'my-source', color: '#abc123' });

      const ts = BaseLoggerService.timestamp;
      expect(ts).toHaveLength(4);
      expect(ts[0]).toMatch(/^%c\[.*- %c.*%c\]$/);
      expect(ts[0]).toContain('my-source');
      expect(ts[1]).toBe('');
      expect(ts[2]).toBe('color: #abc123;');
      expect(ts[3]).toBe('');
    });
  });

  describe('filter', () => {
    it('should return false (not filtered) when enabled and level is high enough', () => {
      BaseLoggerService.enabled = true;
      BaseLoggerService.level = LoggingLevel.trace;

      // Access protected method via bracket notation
      const result = (BaseLoggerService as any).filter(LoggingLevel.error);
      expect(result).toBe(false);
    });

    it('should return true (filtered) when disabled', () => {
      BaseLoggerService.enabled = false;
      BaseLoggerService.level = LoggingLevel.trace;

      const result = (BaseLoggerService as any).filter(LoggingLevel.error);
      expect(result).toBe(true);
    });

    it('should return true (filtered) when call level is below configured level', () => {
      BaseLoggerService.enabled = true;
      BaseLoggerService.level = LoggingLevel.error;

      const result = (BaseLoggerService as any).filter(LoggingLevel.debug);
      expect(result).toBe(true);
    });
  });

  describe('trace', () => {
    it('should call console.trace when not filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.trace;
      const spy = vi.spyOn(console, 'trace').mockImplementation(() => {});

      BaseLoggerService.trace('trace message', 'param1');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'trace message',
        'param1',
      );
    });

    it('should not call console.trace when filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.error;
      const spy = vi.spyOn(console, 'trace').mockImplementation(() => {});

      BaseLoggerService.trace('trace message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should call console.debug when not filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.trace;
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      BaseLoggerService.debug('debug message');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'debug message',
      );
    });

    it('should not call console.debug when filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.error;
      const spy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      BaseLoggerService.debug('debug message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should call console.info when not filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.trace;
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

      BaseLoggerService.info('info message');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'info message',
      );
    });

    it('should not call console.info when filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.error;
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});

      BaseLoggerService.info('info message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should call console.warn when not filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.trace;
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      BaseLoggerService.warn('warn message');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'warn message',
      );
    });

    it('should not call console.warn when filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.error;
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      BaseLoggerService.warn('warn message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should call console.error when not filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.level = LoggingLevel.trace;
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      BaseLoggerService.error('error message');

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining('test'),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'error message',
      );
    });

    it('should not call console.error when filtered', () => {
      BaseLoggerService.init({ source: 'test' });
      BaseLoggerService.enabled = false;
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      BaseLoggerService.error('error message');

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
