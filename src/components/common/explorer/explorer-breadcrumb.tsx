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
    <Breadcrumbs aria-label="breadcrumb" maxItems={3} sx={{ mb: '0.125em', overflow: 'auto', fontSize: '0.875em', minHeight: '2em' }}>
      <Button
        key={`home-${disabled}`}
        variant="text"
        startIcon={<HomeIcon sx={{ width: '0.9375em', height: '0.9375em', mb: '-0.125em', mr: '-0.5em' }} />}
        sx={{ textTransform: 'none', minWidth: '0', mr: '-0.25em', fontSize: '1em' }}
        onClick={$event => onClick && onClick($event, 0)}
        disabled={disabled}
      />
      {crumbs?.map((folder, i) => (
        <Button
          key={`${i}-${disabled}`}
          variant="text"
          startIcon={<FolderIcon sx={{ width: '0.9375em', height: '0.9375em', mb: '-0.125em' }} />}
          sx={{ textTransform: 'none', fontSize: '1em' }}
          onClick={$event => onClick && onClick($event, i + 1)}
          disabled={disabled}
        >
          <Typography
            component={'span'}
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875em', mt: '0.4em' }}
          >
            {folder}
          </Typography>
        </Button>
      ))}
    </Breadcrumbs>
  );
};
