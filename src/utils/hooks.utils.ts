import { useEffect, useState } from 'react';
import { debounce, Subject, timer } from 'rxjs';

/**
 * React hook which call observer on subject inside react effect
 * @param observer the observer
 * @param threshold the debounce threshold
 */
export const useDebounceObservable = <T>(observer: (value: T) => void, threshold = 200): [Subject<T>, Subject<T>['next']] => {
  // Loading observable for debounce
  const [subject$] = useState(() => new Subject<T>());

  useEffect(() => {
    const sub = subject$.pipe(debounce(() => timer(threshold))).subscribe(observer);

    return () => sub.unsubscribe();
  }, [subject$, threshold]);

  return [subject$, (v) => subject$.next(v)];
};
