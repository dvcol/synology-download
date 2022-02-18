import CircularProgress from '@mui/material/CircularProgress';
import { CircularProgressProps } from '@mui/material/CircularProgress/CircularProgress';
import React from 'react';

export const IconLoader = ({ icon, loading, props }: { icon: JSX.Element; loading?: boolean; props?: CircularProgressProps }): JSX.Element => {
  return loading ? <CircularProgress {...props} /> : icon;
};
