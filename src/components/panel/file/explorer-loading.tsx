import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export const ExplorerLoading = ({ loading, empty }: { loading?: boolean; empty?: boolean }) => {
  return (
    <React.Fragment>
      {loading && (
        <Typography sx={{ m: '4px 0', fontSize: '14px' }}>
          <Box component={'span'} sx={{ m: '0 6px 0 12px' }}>
            <CircularProgress size={'0.6rem'} />
          </Box>
          <span>Loading folder content</span>
        </Typography>
      )}
      {!loading && empty && (
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: '8px',
            m: '4px 0',
            fontSize: '14px',
          }}
        >
          <InfoIcon sx={{ width: '16px', height: '16px', mr: '4px' }} />
          <span>This folder does not contain any sub-folders.</span>
        </Typography>
      )}
    </React.Fragment>
  );
};
