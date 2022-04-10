import { LinearProgress } from '@mui/material';

import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';

import { defaultGlobal } from '@src/models';
import { getGlobalLoading, getLoading } from '@src/store/selectors';
import { useDebounceObservable } from '@src/utils';

import type { LinearProgressProps } from '@mui/material';

export const LoadingBar = (props?: LinearProgressProps) => {
  // Loading bar settings
  const { enabled, threshold } = useSelector(getGlobalLoading) ?? defaultGlobal.loading;

  // Loading selector for refresh
  const _loading = useSelector(getLoading);

  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Loading observable for debounce
  const [loading$, next] = useDebounceObservable<boolean>(setLoading, threshold);
  useEffect(() => next(_loading > 0), [loading$, _loading]);

  const show = enabled && loading && _loading > 0;

  return (
    <LinearProgress
      {...props}
      sx={{
        height: '2px',
        transition: 'opacity 0.3s linear',
        opacity: show ? 1 : 0,
      }}
    />
  );
};

export default LoadingBar;
