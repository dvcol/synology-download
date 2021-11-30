import React from 'react';
import { Box, LinearProgress, LinearProgressProps, Typography } from '@mui/material';

const ProgressBar = (props: LinearProgressProps & { value: number }) => (
  <Box sx={{ display: 'flex', alignItems: 'center' }}>
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress variant="determinate" {...props} />
    </Box>
    <Box sx={{ minWidth: 35, display: 'flex', justifyContent: 'end' }}>
      <Typography variant="body2" color="text.secondary" component="span">{`${Math.round(props.value)}%`}</Typography>
    </Box>
  </Box>
);

export default ProgressBar;
