import InfoIcon from '@mui/icons-material/Info';
import { Box, CircularProgress, Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

export const ExplorerLoading = ({ loading, empty }: { loading?: boolean; empty?: boolean }) => {
  const i18n = useI18n('common', 'explorer', 'explorer_loading');
  return (
    <React.Fragment>
      {loading && (
        <Typography sx={{ m: '0.25rem 0', fontSize: '0.875rem' }}>
          <Box component={'span'} sx={{ m: '0 0.375rem 0 0.75rem' }}>
            <CircularProgress size={'0.6rem'} />
          </Box>
          <span>{i18n('content')}</span>
        </Typography>
      )}
      {!loading && empty && (
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: '0.5rem',
            m: '0.25rem 0',
            fontSize: '0.875rem',
          }}
        >
          <InfoIcon sx={{ width: '1rem', height: '1rem', mr: '0.25rem' }} />
          <span>{i18n('empty')}</span>
        </Typography>
      )}
    </React.Fragment>
  );
};
