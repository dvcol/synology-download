import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { debounce, Subject, timer } from 'rxjs';

import { defaultGlobal } from '@src/models';
import { ContainerContext } from '@src/store';
import { getGlobalLoading } from '@src/store/selectors';

/**
 * React hook which call observer on subject inside react effect
 * @param observer the observer
 * @param threshold the debounce threshold
 */
export function useDebounceObservable<T>(observer: (value: T) => void, threshold?: number): [Subject<T>, Subject<T>['next']] {
  // Loading observable for debounce
  const [subject$] = useState(() => new Subject<T>());

  const { threshold: _threshold } = useSelector(getGlobalLoading) ?? defaultGlobal.loading;

  useEffect(() => {
    const sub = subject$.pipe(debounce(() => timer(threshold ?? _threshold))).subscribe(observer);

    return () => sub.unsubscribe();
  }, [subject$, threshold, _threshold, observer]);

  return [subject$, v => subject$.next(v)];
}

export function useAnchor(scrollContainerId: string, offset = 0) {
  const { containerRef } = useContext(ContainerContext);
  const location = useLocation();
  useEffect(() => {
    let scroll: number | undefined;
    if (location.hash) scroll = containerRef?.current?.querySelector<HTMLDivElement>(location.hash)?.offsetTop;
    if (scroll !== undefined) containerRef?.current?.querySelector(`#${scrollContainerId}`)?.scrollTo({ top: scroll + offset });
  }, [containerRef, location, offset, scrollContainerId]);
}
