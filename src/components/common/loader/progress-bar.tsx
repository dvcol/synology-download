import { Box, LinearProgress, Typography } from '@mui/material';

import React from 'react';

import type { LinearProgressProps } from '@mui/material';

import type { FC } from 'react';

export type ProgressBarProps = { props: LinearProgressProps; value: number; percentage?: boolean };
export const ProgressBar: FC<ProgressBarProps> = ({ props, value, percentage }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '1.125rem' }}>
    <Box sx={{ width: '100%', mr: percentage ? '0.5rem' : '0.1875rem' }}>
      <LinearProgress variant="determinate" {...{ ...props, value }} />
    </Box>
    {percentage && (
      <Box sx={{ minWidth: '2.1875rem', display: 'flex', justifyContent: 'end' }}>
        <Typography variant="body2" color="text.secondary" component="span">{`${Math.round(value)}%`}</Typography>
      </Box>
    )}
  </Box>
);

export default ProgressBar;
