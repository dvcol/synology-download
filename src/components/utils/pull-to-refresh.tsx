import { Box, CircularProgress, styled } from '@mui/material';

import React, { useRef, useState } from 'react';

import { pullToRefresh } from '@src/utils';

import type { BoxProps } from '@mui/material';
import type { FC, TouchEventHandler, WheelEventHandler } from 'react';

export type State = { start: number; offset: number; progress: number };
export type Options = { onRefresh?: (state: State) => void };

type LoaderProps = { refreshed: boolean } & State & BoxProps;
const Loader: FC<LoaderProps> = ({ refreshed, start, offset, className, sx, progress, ...props }) => {
  const margin = offset - 88;
  const classNames = [className];

  if (!offset) classNames.push('closing');
  if (!offset && refreshed) classNames.push('refreshed');

  return (
    <Box
      className={classNames.filter(Boolean).join(' ')}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: `${margin <= 0 ? margin : 0}px`,
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          p: '24px',
          mb: `${margin > 0 ? margin : 0}px`,
          transition: !offset ? 'margin-bottom 500ms ease' : '',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <CircularProgress variant="indeterminate" />
      </Box>
    </Box>
  );
};

const StyledLoader = styled(Loader)`
  &.closing {
    transition: margin-top 500ms ease, margin-top 500ms ease;
  }
  &.refreshed {
    animation-name: ${pullToRefresh};
    animation-duration: 1000ms;
    animation-timing-function: ease-in-out;
  }
`;

export const usePullToRefresh = ({ onRefresh }: Options = {}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [refreshed, setRefreshed] = useState(false);
  const [start, setStart] = useState(0);
  const [offset, setOffset] = useState(0);
  const progress = offset / 88;

  const clearOffset = () => {
    setRefreshed(false);
    setOffset(0);
    setStart(0);
  };

  const timeout = useRef<NodeJS.Timeout>();
  const resetTimeout = () => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      clearOffset();
    }, 100);
  };

  const onWheel: WheelEventHandler = e => {
    // if we are not a scroll top, reset timer and set start
    if (ref?.current?.scrollTop !== 0) {
      setStart(ref.current!.scrollTop);
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
    setRefreshed(false);
    setStart(e.touches[0].screenY);
  };

  const onTouchMove: TouchEventHandler = e => {
    if (ref?.current?.scrollTop !== 0) return; // not container scroll top
    const current = e.touches[0].screenY;
    const delta = start - current;
    if (delta > 0) return; // moving up
    setOffset(Math.abs(delta));
  };

  const onTouchEnd: TouchEventHandler = () => {
    if (progress >= 1) {
      onRefresh?.({ start, offset, progress });
      setRefreshed(true);
    }

    setStart(0);
    setOffset(0);
  };

  return {
    ref,
    handlers: { onWheel, onTouchStart, onTouchMove, onTouchEnd },
    Loader: <StyledLoader refreshed={refreshed} start={start} offset={offset} progress={progress} />,
    refreshed,
    progress,
    offset,
    start,
  };
};
