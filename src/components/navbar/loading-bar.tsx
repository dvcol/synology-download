import React, { useEffect, useState } from 'react';
import { LinearProgress, LinearProgressProps } from '@mui/material';
import { useSelector } from 'react-redux';
import { getLoading } from '@src/store/selectors';
import { useDebounceObservable } from '@src/utils/hooks-utils';

export const LoadingBar = (props?: LinearProgressProps) => {
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);

  // Loading observable for debounce
  const loading$ = useDebounceObservable<boolean>(setLoading, 300);

  // Loading selector for refresh
  const _loading = useSelector(getLoading);
  useEffect(() => loading$.next(_loading > 0), [_loading]);

  return (
    <LinearProgress
      {...props}
      sx={{
        height: '2px',
        transition: 'opacity 0.3s linear',
        opacity: loading && _loading > 0 ? 1 : 0,
      }}
    />
  );
};

export default LoadingBar;
