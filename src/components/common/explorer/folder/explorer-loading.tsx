import InfoIcon from '@mui/icons-material/Info';
import { Box, CircularProgress, Typography } from '@mui/material';

import React from 'react';

import { useI18n } from '@src/utils';

export const ExplorerLoading = ({ loading, empty }: { loading?: boolean; empty?: boolean }) => {
  const i18n = useI18n('common', 'explorer', 'explorer_loading');
  return (
    <React.Fragment>
      {loading && (
        <Typography sx={{ m: '0.25em 0', fontSize: '0.875em' }}>
          <Box component={'span'} sx={{ m: '0 0.375em 0 0.75em' }}>
            <CircularProgress size={'0.6em'} />
          </Box>
          <span>{i18n('content')}</span>
        </Typography>
      )}
      {!loading && empty && (
        <Typography
          sx={{
            display: 'flex',
            alignItems: 'center',
            pl: '0.5em',
            m: '0.5em 0',
            fontSize: '0.75em',
          }}
        >
          <InfoIcon sx={{ width: '1em', height: '1em', mr: '0.25em', fontSize: '1.125em' }} />
          <span>{i18n('empty')}</span>
        </Typography>
      )}
    </React.Fragment>
  );
};
