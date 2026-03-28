import type { CircularProgressProps } from '@mui/material';
import type { JSX } from 'react';

import { CircularProgress } from '@mui/material';

export function IconLoader({ icon, loading, props }: { icon: JSX.Element; loading?: boolean; props?: CircularProgressProps }): JSX.Element {
  return loading ? <CircularProgress {...props} /> : icon;
}
