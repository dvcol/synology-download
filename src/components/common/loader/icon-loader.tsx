import CircularProgress from '@mui/material/CircularProgress';

import React from 'react';

import type { CircularProgressProps } from '@mui/material/CircularProgress/CircularProgress';

export const IconLoader = ({ icon, loading, props }: { icon: JSX.Element; loading?: boolean; props?: CircularProgressProps }): JSX.Element => {
  return loading ? <CircularProgress {...props} /> : icon;
};
