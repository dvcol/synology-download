import { Box, LinearProgress, LinearProgressProps, Typography } from '@mui/material';
import React from 'react';

export const ProgressBar = ({ props, value, percentage }: { props: LinearProgressProps; value: number; percentage?: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', minHeight: '18px' }}>
    <Box sx={{ width: '100%', mr: percentage ? '8px' : '3px' }}>
      <LinearProgress variant="determinate" {...{ ...props, value }} />
    </Box>
    {percentage && (
      <Box sx={{ minWidth: 35, display: 'flex', justifyContent: 'end' }}>
        <Typography variant="body2" color="text.secondary" component="span">{`${Math.round(value)}%`}</Typography>
      </Box>
    )}
  </Box>
);

export default ProgressBar;
