import type { File } from '../../../../models/file.model';
import type { Folder } from '../../../../models/folder.model';
import type { Tree, VisibleTree } from './explorer.utils';

import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { TreeItem } from '@mui/x-tree-view';

import { ExplorerLeafEdit } from './explorer-leaf-edit';
import { ExplorerLoading } from './explorer-loading';

export function ExplorerLeaf({
  nodeId,
  folder,
  tree,
  visibleTree,
  loading,
  flatten,
  disabled,
  editable,
  spliceTree,
}: {
  nodeId: string;
  folder: Folder | File;
  tree: Tree;
  visibleTree?: VisibleTree;
  loading: Record<string, boolean>;
  flatten?: boolean;
  disabled?: boolean;
  editable?: boolean;
  spliceTree?: (_nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => void;
}) {
  const isLoading = loading[nodeId];
  const children = tree[nodeId];
  const visibleChildren = visibleTree?.[nodeId] ?? children?.map((item, sourceIndex) => ({ item, sourceIndex }));
  return (
    <TreeItem
      itemId={`${nodeId}`}
      label={
        // only > 2 so that we do not allow renaming of shares
        editable && folder?.isdir && nodeId.split('-')?.length > 2
          ? (
              <ExplorerLeafEdit folder={folder} disabled={disabled} onChange={(...args) => spliceTree?.(nodeId, ...args)} />
            )
          : (
              folder.name
            )
      }
      disabled={disabled}
      slots={folder?.isdir ? (flatten ? { icon: FolderIcon } : undefined) : { icon: InsertDriveFileOutlinedIcon }}
      sx={{
        display: 'flex',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        fontSize: '0.875em',
        minWidth: 'fit-content',
        width: flatten ? '100%' : 'max-content',
      }}
      slotProps={{ content: { style: { overflow: 'hidden', marginBottom: 'auto', paddingBlock: '0.125rem' } } }}
    >
      {!flatten && folder?.isdir && <ExplorerLoading loading={isLoading} disabled={disabled} empty={!children?.length} flatten={flatten} />}
      {!flatten
        && folder?.isdir
        && !isLoading
        && visibleChildren?.map(({ item: sf, sourceIndex }) => (
          <ExplorerLeaf
            key={`${nodeId}-${sourceIndex}-${disabled}`}
            nodeId={`${nodeId}-${sourceIndex}`}
            folder={sf}
            tree={tree}
            visibleTree={visibleTree}
            loading={loading}
            disabled={disabled}
            flatten={flatten}
          />
        ))}
    </TreeItem>
  );
}
