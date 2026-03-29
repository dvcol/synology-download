import type { FC, ReactNode } from 'react';

import { CircularProgress } from '@mui/material';
import * as React from 'react';

export interface SuspenseLoaderProps { element: ReactNode; fallback?: ReactNode }
export const SuspenseLoader: FC<SuspenseLoaderProps> = ({ element, fallback }) => (
  <React.Suspense fallback={fallback ?? <CircularProgress sx={{ position: 'relative', top: 'calc(50% - 20px)', left: 'calc(50% - 20px)' }} />}>
    {element}
  </React.Suspense>
);

export default SuspenseLoader;
