import { useRef } from 'react';

type AnyFunction<T> = (...args: any[]) => Promise<T> | T;
type Timeout = ReturnType<typeof setTimeout>;

interface Ref<T> {
  current: T;
}

export function debounce<T>(
  func: AnyFunction<T>,
  delay = 250,
  timout: Ref<Timeout | undefined> = { current: undefined },
): (...args: Parameters<typeof func>) => Promise<T> {
  const timeoutId = timout;

  return async (...args: Parameters<typeof func>[]): Promise<T> => {
    return new Promise((resolve) => {
      if (timeoutId?.current) clearTimeout(timeoutId?.current);

      timeoutId.current = setTimeout(async () => {
        const result = await func(...args);
        resolve(result);
      }, delay);
    });
  };
}

export function useDebounce<T>(func: AnyFunction<T>, delay = 250) {
  // eslint-disable-next-line react-hooks/refs -- needed for debounce
  return debounce(func, delay, useRef<Timeout>(undefined));
}
