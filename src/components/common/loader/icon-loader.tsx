import type { CircularProgressProps } from '@mui/material';

import { CircularProgress } from '@mui/material';
import React from 'react';

export function IconLoader({ icon, loading, props }: { icon: JSX.Element; loading?: boolean; props?: CircularProgressProps }): JSX.Element {
  return loading ? <CircularProgress {...props} /> : icon;
}
