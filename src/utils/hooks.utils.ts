import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { debounce, Subject, timer } from 'rxjs';

import { defaultGlobal } from '@src/models';
import { getGlobalLoading } from '@src/store/selectors';

import type { DependencyList } from 'react';

/**
 * React hook which call observer on subject inside react effect
 * @param observer the observer
 * @param threshold the debounce threshold
 */
export const useDebounceObservable = <T>(observer: (value: T) => void, threshold?: number): [Subject<T>, Subject<T>['next']] => {
  // Loading observable for debounce
  const [subject$] = useState(() => new Subject<T>());

  const { threshold: _threshold } = useSelector(getGlobalLoading) ?? defaultGlobal.loading;

  useEffect(() => {
    const sub = subject$.pipe(debounce(() => timer(threshold ?? _threshold))).subscribe(observer);

    return () => sub.unsubscribe();
  }, [subject$, threshold, _threshold]);

  return [subject$, v => subject$.next(v)];
};

export const usePrevious = <T>(value: T, deps: DependencyList[] = []) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  }, [value, ...deps]);
  return ref.current;
};
