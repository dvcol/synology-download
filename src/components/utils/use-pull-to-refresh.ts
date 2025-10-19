import type { MutableRefObject, TouchEventHandler, WheelEventHandler } from 'react';

import { useRef, useState } from 'react';

export const animationSpeed = 300;
export interface State { start: number; offset: number; progress: number }
export type OnRefreshCallback = (state: State) => void;
export interface Options {
  onRefresh?: OnRefreshCallback;
  disabled?: MutableRefObject<boolean>;
  loaderHeight?: number;
  animationSpeed?: number;
}

export function usePullToRefresh(options: Options = {}) {
  const { onRefresh, disabled, loaderHeight } = { loaderHeight: 76, ...options };
  const containerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const [refreshed, setRefreshed] = useState(false);
  const [start, setStart] = useState(0);
  const [offset, setOffset] = useState(0);
  const progress = offset / loaderHeight;

  const clearOffset = () => {
    setStart(0);
    setOffset(0);
    setRefreshed(false);
  };

  const timeout = useRef<NodeJS.Timeout>();
  const resetTimeout = (speed = 100) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      clearOffset();
    }, speed);
  };

  const onWheel: WheelEventHandler = (e) => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    // if we are not a scroll top, reset timer and set start
    if (containerRef?.current && containerRef.current.scrollTop !== 0) {
      setStart(containerRef.current.scrollTop);
      return resetTimeout();
    }
    // If we have start reset timer to prevent inertial scroll
    if (start) return resetTimeout();

    if (Math.abs(e.deltaX) > 10) return clearOffset(); // side scrolling
    if (e.deltaY >= 0) return clearOffset(); // scrolling up
    if (e.ctrlKey) return clearOffset(); // pinch/zoom

    // If progress and not refreshed yet, emit refresh
    if (progress >= 1 && !refreshed) {
      onRefresh?.({ start, offset, progress });
      setRefreshed(true);
      return resetTimeout(animationSpeed);
    }
    // else update the offset
    if (!refreshed) {
      setOffset(_offset => _offset + Math.abs(e.deltaY / 3));
    }

    resetTimeout();
  };

  const onTouchStart: TouchEventHandler = (e) => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    setRefreshed(false);
    setStart(e.touches[0].screenY);
  };

  const onTouchMove: TouchEventHandler = (e) => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    if (containerRef?.current?.scrollTop !== 0) return; // not container scroll top
    const current = e.touches[0].screenY;
    const delta = start - current;
    if (delta > 0) return; // moving up
    setOffset(Math.abs(delta));
  };

  const onTouchEnd: TouchEventHandler = (e) => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    if (progress >= 1) {
      onRefresh?.({ start, offset, progress });
      setRefreshed(true);
      return resetTimeout(animationSpeed);
    }

    clearOffset();
  };

  return {
    handlers: { onWheel, onTouchStart, onTouchMove, onTouchEnd },
    containerRef,
    loaderRef,
    loaderHeight,
    refreshed,
    progress,
    offset,
    start,
  };
}
