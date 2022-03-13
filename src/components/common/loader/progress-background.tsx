import { Box } from '@mui/material';
import React, { FC } from 'react';

export type ProgressBackgroundProps = { primary?: string; secondary?: string; progress?: number };

export const ProgressBackground: FC<ProgressBackgroundProps> = ({ primary, secondary, progress }) => (
  <Box sx={{ position: 'absolute', height: '100%', width: '100%', display: 'flex', flexDirection: 'row' }}>
    <Box
      sx={{
        background: primary ?? 'transparent',
        transition: 'width 1s linear',
        height: '100%',
        width: `${progress ?? 100}%`,
      }}
    />
    {secondary && (
      <Box
        sx={{
          background: secondary ?? 'transparent',
          height: '100%',
          width: `${100 - (progress ?? 100)}%`,
        }}
      />
    )}
  </Box>
);

export default ProgressBackground;
