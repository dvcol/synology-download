import { useEffect, useState } from 'react';
import { debounceTime, Subject, tap } from 'rxjs';

/**
 * React hook which call observer on subject inside react effect
 * @param observer the observer
 * @param timer the debounce timer
 */
export const useDebounceObservable = <T>(observer: (value: T) => void, timer = 200): Subject<T> => {
  // Loading observable for debounce
  const [subject$] = useState(() => new Subject<T>());
  useEffect(() => {
    const sub = subject$
      .pipe(
        debounceTime(timer),
        tap((v) => console.log('observable', v))
      )
      .subscribe(observer);
    return () => sub.unsubscribe();
  }, []);

  return subject$;
};
