import React from 'react';
import { File, Folder } from '../../../models';
import { TreeItem } from '@mui/lab';
import { Box, CircularProgress, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

export const ExplorerLeaf = ({
  nodeId,
  folder,
  tree,
  loading,
  disabled,
}: {
  nodeId: string;
  folder: Folder | File;
  tree: Record<string, Folder[] | File[]>;
  loading: Record<string, boolean>;
  disabled?: boolean;
}) => {
  const isLoading = loading[nodeId];
  const children = tree[nodeId];

  return (
    <TreeItem nodeId={`${nodeId}`} label={folder.name} disabled={disabled}>
      {isLoading && (
        <Typography sx={{ m: '0.25rem 0' }}>
          <Box component={'span'} sx={{ m: '0 0.3rem 0 0.7rem' }}>
            <CircularProgress size={'0.6rem'} />
          </Box>
          <span>Loading folder content</span>
        </Typography>
      )}
      {!isLoading && !children?.length && (
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
      {!isLoading &&
        children?.map((sf, i) => (
          <ExplorerLeaf key={`${nodeId}-${i}`} nodeId={`${nodeId}-${i}`} folder={sf} tree={tree} loading={loading} disabled={disabled} />
        ))}
    </TreeItem>
  );
};
