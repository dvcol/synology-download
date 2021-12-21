import { Breadcrumbs, Button, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import React from 'react';

export const ExplorerBreadCrumbs = ({
  crumbs,
  onClick,
  disabled,
}: {
  crumbs: string[];
  onClick: ($event: React.MouseEvent, index: number) => void;
  disabled?: boolean;
}) => {
  return (
    <Breadcrumbs aria-label="breadcrumb" maxItems={4}>
      <Button
        key={`home-${disabled}`}
        variant="text"
        sx={{ textTransform: 'none', minWidth: '0', mr: '-4px' }}
        onClick={($event) => onClick($event, 0)}
        disabled={disabled}
      >
        <HomeIcon sx={{ width: '0.9rem', height: '0.9rem', mb: '2px' }} />
      </Button>
      {crumbs?.map((folder, i) => (
        <Button
          key={`${i}-${disabled}`}
          variant="text"
          startIcon={<FolderIcon sx={{ width: '0.9rem', height: '0.9rem', mb: '2px' }} />}
          sx={{ textTransform: 'none' }}
          onClick={($event) => onClick($event, i + 1)}
          disabled={disabled}
        >
          <Typography component={'span'} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {folder}
          </Typography>
        </Button>
      ))}
    </Breadcrumbs>
  );
};
