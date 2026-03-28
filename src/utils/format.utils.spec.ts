import { computeProgress, dateToLocalString, formatBytes, formatTime } from './format.utils';

describe('format.utils', () => {
  describe('computeProgress', () => {
    it('should return 0 when downloaded is 0', () => {
      expect(computeProgress(0, 100)).toBe(0);
    });

    it('should return 0 when size is 0', () => {
      expect(computeProgress(50, 0)).toBe(0);
    });

    it('should return 0 for NaN inputs', () => {
      expect(computeProgress('abc', 100)).toBe(0);
      expect(computeProgress(50, 'xyz')).toBe(0);
    });

    it('should return 0 for null/undefined inputs', () => {
      expect(computeProgress(null, 100)).toBe(0);
      expect(computeProgress(undefined, 100)).toBe(0);
    });

    it('should compute progress correctly', () => {
      expect(computeProgress(50, 100)).toBe(50);
      expect(computeProgress(100, 100)).toBe(100);
      expect(computeProgress(25, 200)).toBe(12);
    });

    it('should handle string number inputs', () => {
      expect(computeProgress('54642', '123456')).toBe(44);
    });

    it('should floor the result', () => {
      expect(computeProgress(1, 3)).toBe(33);
    });
  });

  describe('formatTime', () => {
    it('should format seconds only', () => {
      expect(formatTime(45)).toBe('0m 45s');
    });

    it('should format minutes and seconds', () => {
      expect(formatTime(125)).toBe('2m 05s');
    });

    it('should format hours, minutes, and seconds', () => {
      expect(formatTime(3661)).toBe('1h 01m 01s');
    });

    it('should handle zero', () => {
      expect(formatTime(0)).toBe('0m 00s');
    });

    it('should pad seconds with zero', () => {
      expect(formatTime(61)).toBe('1m 01s');
    });

    it('should pad minutes with zero when hours are present', () => {
      expect(formatTime(3605)).toBe('1h 00m 05s');
    });
  });

  describe('formatBytes', () => {
    it('should return "0 B" for 0', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('should return "0 B" for NaN input', () => {
      expect(formatBytes('abc')).toBe('0 B');
    });

    it('should return "0 B" for null', () => {
      expect(formatBytes(null)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(1000)).toBe('1 kB');
    });

    it('should handle string number inputs', () => {
      expect(formatBytes('1000')).toBe('1 kB');
    });
  });

  describe('dateToLocalString', () => {
    it('should return undefined for undefined input', () => {
      expect(dateToLocalString(undefined)).toBeUndefined();
    });

    it('should return undefined for 0', () => {
      expect(dateToLocalString(0)).toBeUndefined();
    });

    it('should return locale string for valid date', () => {
      const result = dateToLocalString(1609459200000);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
});
