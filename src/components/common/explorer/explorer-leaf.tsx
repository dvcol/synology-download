import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { TreeItem } from '@mui/lab';

import React from 'react';

import { ExplorerLoading } from '@src/components';
import { File, Folder } from '@src/models';

export const ExplorerLeaf = ({
  nodeId,
  folder,
  tree,
  loading,
  flatten,
  disabled,
}: {
  nodeId: string;
  folder: Folder | File;
  tree: Record<string, Folder[] | File[]>;
  loading: Record<string, boolean>;
  flatten?: boolean;
  disabled?: boolean;
}) => {
  const isLoading = loading[nodeId];
  const children = tree[nodeId];

  return (
    <TreeItem
      nodeId={`${nodeId}`}
      label={folder.name}
      disabled={disabled}
      icon={folder?.isdir ? undefined : <InsertDriveFileOutlinedIcon />}
      sx={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontSize: '14px' }}
    >
      {!flatten && folder?.isdir && <ExplorerLoading loading={isLoading} empty={!children?.length} />}
      {!flatten &&
        folder?.isdir &&
        !isLoading &&
        children?.map((sf, i) => (
          <ExplorerLeaf key={`${nodeId}-${i}-${disabled}`} nodeId={`${nodeId}-${i}`} folder={sf} tree={tree} loading={loading} disabled={disabled} />
        ))}
    </TreeItem>
  );
};
