import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export const ExplorerLoading = ({ loading, empty }: { loading?: boolean; empty?: boolean }) => {
  return (
    <React.Fragment>
      {loading && (
        <Typography sx={{ m: '0.25rem 0' }}>
          <Box component={'span'} sx={{ m: '0 0.3rem 0 0.7rem' }}>
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
            pl: '0.5rem',
            m: '0.25rem 0',
          }}
        >
          <InfoIcon sx={{ width: '1rem', height: '1rem', mr: '0.25rem' }} />
          <span>This folder does not contain any sub-folders.</span>
        </Typography>
      )}
    </React.Fragment>
  );
};
