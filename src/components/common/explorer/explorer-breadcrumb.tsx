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
    <Breadcrumbs aria-label="breadcrumb" maxItems={3} sx={{ mb: '2px', overflow: 'auto', fontSize: '14px' }}>
      <Button
        key={`home-${disabled}`}
        variant="text"
        sx={{ textTransform: 'none', minWidth: '0', mr: '-4px', fontSize: '12px' }}
        onClick={($event) => onClick && onClick($event, 0)}
        disabled={disabled}
      >
        <HomeIcon sx={{ width: '15px', height: '15px', mb: '-2px' }} />
      </Button>
      {crumbs?.map((folder, i) => (
        <Button
          key={`${i}-${disabled}`}
          variant="text"
          startIcon={<FolderIcon sx={{ width: '15px', height: '15px', mb: '-2px', fontSize: '12px' }} />}
          sx={{ textTransform: 'none' }}
          onClick={($event) => onClick && onClick($event, i + 1)}
          disabled={disabled}
        >
          <Typography component={'span'} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px' }}>
            {folder}
          </Typography>
        </Button>
      ))}
    </Breadcrumbs>
  );
};
