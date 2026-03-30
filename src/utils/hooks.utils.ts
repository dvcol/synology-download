import type { Dispatch, SetStateAction } from 'react';

import { use, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { debounce, Subject, timer } from 'rxjs';

import { defaultGlobal } from '../models/settings.model';
import { ContainerContext } from '../store/context/container.context';
import { getGlobalLoading } from '../store/selectors/settings.selector';

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
  const { containerRef } = use(ContainerContext);
  const location = useLocation();
  useEffect(() => {
    let scroll: number | undefined;
    if (location.hash) scroll = containerRef?.current?.querySelector<HTMLDivElement>(location.hash)?.offsetTop;
    if (scroll !== undefined) containerRef?.current?.querySelector(`#${scrollContainerId}`)?.scrollTo({ top: scroll + offset });
  }, [containerRef, location, offset, scrollContainerId]);
}

/**
 * React hook which sync an internal state with an external value, using a custom equality function to determine when to update the internal state.
 */
export function useSyncedState<T>(
  externalValue: T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(externalValue);
  const [prev, setPrev] = useState(externalValue);

  if (!isEqual(externalValue, prev)) {
    setPrev(externalValue);
    setValue(externalValue);
  }

  return [value, setValue];
}
