import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { TreeItem } from '@mui/lab';
import React from 'react';

import type { File, Folder } from '@src/models';

import { ExplorerLeafEdit } from './explorer-leaf-edit';
import { ExplorerLoading } from './explorer-loading';

export const ExplorerLeaf = ({
  nodeId,
  folder,
  tree,
  loading,
  flatten,
  disabled,
  editable,
  spliceTree,
}: {
  nodeId: string;
  folder: Folder | File;
  tree: Record<string, Folder[] | File[]>;
  loading: Record<string, boolean>;
  flatten?: boolean;
  disabled?: boolean;
  editable?: boolean;
  spliceTree?: (_nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => void;
}) => {
  const isLoading = loading[nodeId];
  const children = tree[nodeId];
  return (
    <TreeItem
      nodeId={`${nodeId}`}
      label={
        // only > 2 so that we do not allow renaming of shares
        editable && folder?.isdir && nodeId.split('-')?.length > 2 ? (
          <ExplorerLeafEdit folder={folder} disabled={disabled} onChange={(...args) => spliceTree?.(nodeId, ...args)} />
        ) : (
          folder.name
        )
      }
      disabled={disabled}
      icon={folder?.isdir ? undefined : <InsertDriveFileOutlinedIcon />}
      sx={{
        display: 'flex',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.875em',
        minWidth: 'fit-content',
        width: flatten ? '100%' : 'max-content',
      }}
      ContentProps={{ style: { overflow: 'hidden', marginBottom: 'auto' } }}
    >
      {!flatten && folder?.isdir && <ExplorerLoading loading={isLoading} empty={!children?.length} flatten={flatten} />}
      {!flatten &&
        folder?.isdir &&
        !isLoading &&
        children?.map((sf, i) => (
          <ExplorerLeaf
            key={`${nodeId}-${i}-${disabled}`}
            nodeId={`${nodeId}-${i}`}
            folder={sf}
            tree={tree}
            loading={loading}
            disabled={disabled}
            flatten={flatten}
          />
        ))}
    </TreeItem>
  );
};
