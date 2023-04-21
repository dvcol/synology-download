import { useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { debounce, Subject, timer } from 'rxjs';

import { defaultGlobal } from '@src/models';
import { ContainerContext } from '@src/store';
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

export const usePrevious = <T>(value: T, deps: DependencyList[] = []): [T | undefined, (value: T) => void] => {
  const ref = useRef<T>();
  const setRef = (_value: T) => {
    ref.current = _value;
  };
  useEffect(() => {
    ref.current = value;
  }, [value, ...deps]);
  return [ref.current, setRef];
};

export const useAnchor = (scrollContainerId: string, offset = 0) => {
  const { containerRef } = useContext(ContainerContext);
  const location = useLocation();
  useEffect(() => {
    let scroll: number | undefined;
    if (location.hash) scroll = containerRef?.current?.querySelector<HTMLDivElement>(location.hash)?.offsetTop;
    if (scroll !== undefined) containerRef?.current?.querySelector(`#${scrollContainerId}`)?.scrollTo({ top: scroll + offset });
  }, [location]);
};
