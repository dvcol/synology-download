import FolderIcon from '@mui/icons-material/Folder';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';
import { Breadcrumbs, Button, Tooltip, Typography } from '@mui/material';
import React from 'react';

import { useI18n } from '@src/utils';

export const ExplorerBreadCrumbs = ({
  crumbs,
  onClick,
  onRecent,
  disabled,
  hasDestinations,
  showDestinations,
}: {
  crumbs: string[];
  onClick?: ($event: React.MouseEvent, index: number) => void;
  onRecent?: ($event: React.MouseEvent) => void;
  disabled?: boolean;
  hasDestinations?: boolean;

  showDestinations?: boolean;
}) => {
  const i18n = useI18n('common', 'explorer', 'breadcrumb');
  return (
    <Breadcrumbs aria-label="breadcrumb" maxItems={3} sx={{ mb: '0.125em', overflow: 'auto', fontSize: '0.875em', minHeight: '2em' }}>
      {crumbs?.length || !hasDestinations ? (
        <Tooltip arrow title={i18n('home')}>
          <Button
            key={`home-${disabled}`}
            variant="text"
            startIcon={<HomeIcon sx={{ width: '0.9375em', height: '0.9375em', mb: '-0.125em', mr: '-0.5em' }} />}
            sx={{ textTransform: 'none', minWidth: '0', mr: '-0.25em', fontSize: '1em' }}
            onClick={$event => onClick?.($event, 0)}
            disabled={disabled}
          />
        </Tooltip>
      ) : (
        <Button
          key={`recent-${disabled}`}
          variant="text"
          startIcon={
            showDestinations ? (
              <HomeIcon sx={{ width: '0.9375em', height: '0.9375em' }} />
            ) : (
              <HistoryIcon sx={{ width: '0.9375em', height: '0.9375em' }} />
            )
          }
          sx={{ textTransform: 'none', minWidth: '0', fontSize: '1em' }}
          onClick={$event => onRecent?.($event)}
          disabled={disabled}
        >
          {i18n(showDestinations ? 'show__explorer' : 'show__recent')}
        </Button>
      )}
      {crumbs?.map((folder, i) => (
        <Tooltip key={`${i}-${disabled}`} title={folder} PopperProps={{ disablePortal: true, sx: { wordBreak: 'break-all' } }} enterDelay={500}>
          <Button
            variant="text"
            startIcon={<FolderIcon sx={{ width: '0.9375em', height: '0.9375em', mb: '-0.125em' }} />}
            sx={{ textTransform: 'none', fontSize: '1em' }}
            onClick={$event => onClick?.($event, i + 1)}
            disabled={disabled}
          >
            <Typography
              component={'span'}
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875em', mt: '0.4em' }}
            >
              {folder}
            </Typography>
          </Button>
        </Tooltip>
      ))}
    </Breadcrumbs>
  );
};
