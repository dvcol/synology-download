import InfoIcon from '@mui/icons-material/Info';
import { Box, CircularProgress, Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@dvcol/web-extension-utils';

export const ExplorerLoading = ({ loading, empty }: { loading?: boolean; empty?: boolean }) => {
  const i18n = useI18n('common', 'explorer', 'explorer_loading');
  return (
    <React.Fragment>
      {loading && (
        <Typography sx={{ m: '4px 0', fontSize: '14px' }}>
          <Box component={'span'} sx={{ m: '0 6px 0 12px' }}>
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
            pl: '8px',
            m: '4px 0',
            fontSize: '14px',
          }}
        >
          <InfoIcon sx={{ width: '16px', height: '16px', mr: '4px' }} />
          <span>{i18n('empty')}</span>
        </Typography>
      )}
    </React.Fragment>
  );
};
