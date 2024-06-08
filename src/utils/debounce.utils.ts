// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic type
import { useRef } from 'react';

type AnyFunction<T> = (...args: any[]) => Promise<T> | T;
type Timeout = ReturnType<typeof setTimeout>;

type Ref<T> = {
  current: T;
};

export function debounce<T>(
  func: AnyFunction<T>,
  delay = 250,
  timout: Ref<Timeout | undefined> = { current: undefined },
): (...args: Parameters<typeof func>) => Promise<T> {
  const timeoutId = timout;

  return async (...args: Parameters<typeof func>[]): Promise<T> => {
    return new Promise(resolve => {
      if (timeoutId?.current) clearTimeout(timeoutId?.current);

      timeoutId.current = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, delay);
    });
  };
}

export const useDebounce = <T>(func: AnyFunction<T>, delay = 250) => {
  return debounce(func, delay, useRef<Timeout>());
};
