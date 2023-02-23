import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import { Breadcrumbs, Button, Typography } from '@mui/material';
import React from 'react';

export const ExplorerBreadCrumbs = ({
  crumbs,
  onClick,
  disabled,
}: {
  crumbs: string[];
  onClick?: ($event: React.MouseEvent, index: number) => void;
  disabled?: boolean;
}) => {
  return (
    <Breadcrumbs aria-label="breadcrumb" maxItems={3} sx={{ mb: '0.125rem', overflow: 'auto', fontSize: '0.875rem' }}>
      <Button
        key={`home-${disabled}`}
        variant="text"
        sx={{ textTransform: 'none', minWidth: '0', mr: '-0.25rem', fontSize: '0.75rem' }}
        onClick={$event => onClick && onClick($event, 0)}
        disabled={disabled}
      >
        <HomeIcon sx={{ width: '0.9375rem', height: '0.9375rem', mb: '-0.125rem' }} />
      </Button>
      {crumbs?.map((folder, i) => (
        <Button
          key={`${i}-${disabled}`}
          variant="text"
          startIcon={<FolderIcon sx={{ width: '0.9375rem', height: '0.9375rem', mb: '-0.125rem', fontSize: '0.75rem' }} />}
          sx={{ textTransform: 'none' }}
          onClick={$event => onClick && onClick($event, i + 1)}
          disabled={disabled}
        >
          <Typography component={'span'} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
            {folder}
          </Typography>
        </Button>
      ))}
    </Breadcrumbs>
  );
};
