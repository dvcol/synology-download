import { Box, CircularProgress, styled } from '@mui/material';

import React, { forwardRef, useRef, useState } from 'react';

import { pullToRefresh } from '@src/utils';

import type { BoxProps } from '@mui/material';
import type { FC, ForwardRefRenderFunction, MutableRefObject, TouchEventHandler, WheelEventHandler } from 'react';

const animationSpeed = 300;
export type State = { start: number; offset: number; progress: number };
export type OnRefreshCallback = (state: State) => void;
export type Options = {
  onRefresh?: OnRefreshCallback;
  disabled?: MutableRefObject<boolean>;
  loaderHeight?: number;
  animationSpeed?: number;
};

export const usePullToRefresh = (options: Options = {}) => {
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

  const onWheel: WheelEventHandler = e => {
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

  const onTouchStart: TouchEventHandler = e => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    setRefreshed(false);
    setStart(e.touches[0].screenY);
  };

  const onTouchMove: TouchEventHandler = e => {
    // stop propagation to parent containers
    e.stopPropagation();

    if (disabled?.current) return clearOffset();
    if (containerRef?.current?.scrollTop !== 0) return; // not container scroll top
    const current = e.touches[0].screenY;
    const delta = start - current;
    if (delta > 0) return; // moving up
    setOffset(Math.abs(delta));
  };

  const onTouchEnd: TouchEventHandler = e => {
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
};

type LoaderProps = { refreshed: boolean; height: number; top?: number } & State & BoxProps;
type SpinnerProps = Pick<LoaderProps, 'refreshed' | 'offset' | 'progress' | 'top'>;
const Spinner: FC<SpinnerProps> = ({ offset, progress, top }) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: top ? `${top + 48}px` : '48px',
        height: '48px',
        width: ' 48px',
        margin: '14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${progress <= 1 ? progress : 1})`,
        transition: offset ? '' : `transform ${animationSpeed}ms ease`,
      }}
    >
      <CircularProgress variant="indeterminate" />
    </Box>
  );
};

const Loader: ForwardRefRenderFunction<HTMLDivElement, LoaderProps> = (
  { refreshed, height, start, offset, className, sx, progress, top, children, ...props },
  ref,
) => {
  const margin = offset - height;
  const classNames = [className];

  if (!offset) classNames.push('closing');
  if (!offset && refreshed) classNames.push('refreshed');

  return (
    <Box
      ref={ref}
      className={classNames.filter(Boolean).join(' ')}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        minHeight: height,
        mt: `${margin <= 0 ? margin : 0}px`,
        ...sx,
      }}
      {...props}
    >
      {children || <Spinner offset={offset} refreshed={refreshed} progress={progress} top={top} />}
    </Box>
  );
};

const StyledLoader = styled(forwardRef(Loader))`
  &.closing {
    transition: margin-top ${animationSpeed}ms ease;
  }
  &.refreshed {
    animation-name: ${pullToRefresh};
    animation-duration: ${animationSpeed * 2}ms;
    animation-timing-function: ease-in-out;
  }
`;

export type RefreshLoaderProps = {
  loaderRef: React.RefObject<HTMLDivElement>;
  loaderHeight: number;
  loaderContent?: JSX.Element;
  loaderTop?: number;
  refreshed: boolean;
} & State;

export const RefreshLoader: FC<RefreshLoaderProps> = ({ loaderRef, loaderTop, loaderHeight, loaderContent, start, refreshed, progress, offset }) => {
  return (
    <StyledLoader ref={loaderRef} height={loaderHeight} top={loaderTop} refreshed={refreshed} start={start} offset={offset} progress={progress}>
      {loaderContent}
    </StyledLoader>
  );
};
