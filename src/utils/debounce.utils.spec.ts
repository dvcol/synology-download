import { debounce } from './debounce.utils';

describe('debounce.utils', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  describe('debounce', () => {
    it('should delay function execution', async () => {
      const fn = jest.fn(() => 'result');
      const debounced = debounce(fn, 100);

      const promise = debounced();
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      await promise;

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should cancel previous calls when called again', () => {
      const fn = jest.fn(() => 'result');
      const debounced = debounce(fn, 100);

      void debounced();
      void debounced();
      void debounced();

      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to the function', async () => {
      const fn = jest.fn((a: number, b: number) => a + b);
      const debounced = debounce(fn, 50);

      const promise = debounced(1, 2);
      jest.advanceTimersByTime(50);
      const result = await promise;

      expect(fn).toHaveBeenCalledWith(1, 2);
      expect(result).toBe(3);
    });

    it('should use default delay of 250ms', () => {
      const fn = jest.fn();
      const debounced = debounce(fn);

      void debounced();
      jest.advanceTimersByTime(249);
      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
