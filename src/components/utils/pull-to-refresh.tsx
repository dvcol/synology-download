import type { BoxProps } from '@mui/material';
import type { FC, ForwardRefRenderFunction, JSX } from 'react';

import type { State } from './use-pull-to-refresh';

import { Box, CircularProgress, styled } from '@mui/material';
import React, { forwardRef } from 'react';

import { pullToRefresh } from '../../utils/animations.utils';
import { animationSpeed } from './use-pull-to-refresh';

type LoaderProps = { refreshed: boolean; height: number; top?: number } & State & Omit<BoxProps, 'height'>;
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
  { refreshed, height, start, offset, className, sx, progress, top, children, ...props }: LoaderProps,
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
  loaderRef: React.RefObject<HTMLDivElement | null>;
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
