import InfoIcon from '@mui/icons-material/Info';
import { Box, CircularProgress, Typography } from '@mui/material';

import { useI18n } from '../../../../utils/webex.utils';

export function ExplorerLoading({
  disabled,
  loading,
  empty,
  text = 'folder',
  flatten,
}: {
  disabled?: boolean;
  loading?: boolean;
  empty?: boolean;
  flatten?: boolean;
  text?: string;
}) {
  const i18n = useI18n('common', 'explorer', 'explorer_loading', text);
  return (
    <>
      {loading && (
        <Typography sx={{ m: '0.25em 0', fontSize: '0.875em', minWidth: flatten ? undefined : 'max-content' }}>
          <Box component="span" sx={{ m: '0 0.75em 0 0.75em' }}>
            <CircularProgress size="0.6em" />
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
            m: `${flatten ? '0.5em' : '0.2em'} 0`,
            minWidth: flatten ? undefined : 'max-content',
            opacity: disabled ? '0.38' : undefined,
          }}
        >
          <InfoIcon sx={{ width: '1em', height: '1em', m: `0 0.25em ${flatten ? '0.025em' : '0'} 0`, fontSize: flatten ? '1.125em' : '1em' }} />
          <span>{i18n('empty')}</span>
        </Typography>
      )}
    </>
  );
}
