import { Box, CircularProgress, styled } from '@mui/material';

import React, { forwardRef, useRef, useState } from 'react';

import { pullToRefresh } from '@src/utils';

import type { BoxProps } from '@mui/material';
import type { FC, ForwardRefRenderFunction, MutableRefObject, TouchEventHandler, WheelEventHandler } from 'react';

const animationSpeed = 250;
export type State = { start: number; offset: number; progress: number };
export type Options = {
  onRefresh?: (state: State) => void;
  disabled?: MutableRefObject<boolean>;
  loaderHeight?: number;
  loaderContent?: JSX.Element;
  animationSpeed?: number;
};

type SpinnerProps = Pick<LoaderProps, 'refreshed' | 'offset' | 'progress'>;
const Spinner: FC<SpinnerProps> = ({ progress }) => {
  return (
    <Box
      sx={{
        transform: `scale(${progress <= 1 ? progress : 1})`,
        height: '48px',
        width: ' 48px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress variant="indeterminate" />
    </Box>
  );
};

type LoaderProps = { refreshed: boolean; height: number } & State & BoxProps;
const Loader: ForwardRefRenderFunction<HTMLDivElement, LoaderProps> = (
  { refreshed, height, start, offset, className, sx, progress, children, ...props },
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
      <Box
        sx={{
          p: '14px',
          mb: `${margin > 0 ? margin : 0}px`,
          transition: !offset ? `margin-bottom ${animationSpeed}ms ease` : '',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {children || <Spinner offset={offset} refreshed={refreshed} progress={progress} />}
      </Box>
    </Box>
  );
};

const StyledLoader = styled(forwardRef(Loader))`
  &.closing {
    transition: margin-top ${animationSpeed}ms ease, margin-top ${animationSpeed}ms ease;
  }
  &.refreshed {
    animation-name: ${pullToRefresh};
    animation-duration: ${animationSpeed * 2}ms;
    animation-timing-function: ease-in-out;
  }
`;

export const usePullToRefresh = (options: Options = {}) => {
  const { onRefresh, disabled, loaderHeight, loaderContent } = { loaderHeight: 76, ...options };
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
  const resetTimeout = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      clearOffset();
    }, 100);
  };

  const onWheel: WheelEventHandler = e => {
    if (disabled?.current) return clearOffset();
    // if we are not a scroll top, reset timer and set start
    if (containerRef?.current?.scrollTop !== 0) {
      setStart(containerRef.current!.scrollTop);
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
    }
    // else update the offset
    else if (!refreshed) {
      setOffset(_offset => _offset + Math.abs(e.deltaY / 3));
    }

    resetTimeout();
  };

  const onTouchStart: TouchEventHandler = e => {
    if (disabled?.current) return clearOffset();
    setRefreshed(false);
    setStart(e.touches[0].screenY);
  };

  const onTouchMove: TouchEventHandler = e => {
    if (disabled?.current) return clearOffset();
    if (containerRef?.current?.scrollTop !== 0) return; // not container scroll top
    const current = e.touches[0].screenY;
    const delta = start - current;
    if (delta > 0) return; // moving up
    setOffset(Math.abs(delta));
  };

  const onTouchEnd: TouchEventHandler = () => {
    if (disabled?.current) return clearOffset();
    if (progress >= 1) {
      onRefresh?.({ start, offset, progress });
      setRefreshed(true);
    }

    setStart(0);
    setOffset(0);
  };

  return {
    containerRef,
    loaderRef,
    handlers: { onWheel, onTouchStart, onTouchMove, onTouchEnd },
    Loader: (
      <StyledLoader ref={loaderRef} height={loaderHeight} refreshed={refreshed} start={start} offset={offset} progress={progress}>
        {loaderContent}
      </StyledLoader>
    ),
    refreshed,
    progress,
    offset,
    start,
  };
};
