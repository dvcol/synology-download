import React, { useEffect } from 'react';
import { File, FileList, Folder } from '@src/models';
import { QueryService } from '@src/services';
import { finalize, Observable, tap } from 'rxjs';
import { TreeView } from '@mui/lab';
import { Container } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { ExplorerBreadCrumbs, ExplorerLoading } from '@src/components';
import { ExplorerLeaf } from './explorer-leaf';

export type ExplorerProps = {
  collapseOnSelect?: boolean;
  flatten?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  fileType?: 'dir' | 'all';
  startPath?: string;
  onChange?: (event: ExplorerEvent) => void;
};

export type ExplorerEvent = { id?: string; path?: string; folder?: File | Folder };

// TODO implement virtual scroll
export const Explorer = ({ collapseOnSelect, flatten, disabled, readonly, fileType, startPath, onChange }: ExplorerProps) => {
  const [tree, setTree] = React.useState<Record<string, File[] | Folder[]>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({ root: true });
  const [selected, setSelected] = React.useState<string>('root');
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [crumbs, setCrumbs] = React.useState<string[]>([]);

  useEffect(() => {
    QueryService.isReady &&
      QueryService.listFolders(readonly ?? true).subscribe((list) => {
        setTree({ root: list?.shares ?? [] });
        setLoading({ ...loading, root: false });
      });
  }, []);

  useEffect(() => {
    if (startPath?.length) setCrumbs(startPath?.includes('/') ? startPath?.split('/') : [startPath]);
  }, [startPath]);

  const listFiles = (path: string, key: string): Observable<FileList> => {
    setLoading({ ...loading, [key]: true });
    return QueryService.listFiles(path, fileType ?? 'dir').pipe(
      tap((list: FileList) => setTree({ ...tree, [key]: list?.files ?? [] })),
      finalize(() => {
        setTimeout(() => setLoading({ ...loading, [key]: false }), 200);
      })
    );
  };

  const onSelectChange = (id: string, path: string[], folder?: File | Folder) => {
    setSelected(id);
    setCrumbs(path);
    onChange && onChange({ id, path: path.join('/'), folder });
  };

  const selectNode = (nodeId: string) => {
    if (selected !== nodeId) {
      const ids = nodeId.split('-');
      const index = Number(ids.pop());
      const folder = tree[ids?.join('-')][index];
      const path = folder.path.split('/')?.slice(1);

      if (!flatten && collapseOnSelect) {
        setExpanded([...expanded.filter((id) => nodeId.startsWith(id)), nodeId]);
      }

      if (!tree[nodeId] && flatten) {
        onSelectChange(nodeId, path);
        listFiles(folder.path, nodeId).subscribe();
      } else if (!tree[nodeId]) {
        listFiles(folder.path, nodeId).subscribe(() => onSelectChange(nodeId, path, folder));
      } else {
        onSelectChange(nodeId, path, folder);
      }
    }
  };

  const crumbSelect = (index?: number) => {
    if (index) {
      const ids = selected.split('-');
      if (index < ids?.length - 1) {
        ids.pop();
        selectNode(ids.join('-'));
      }
    } else {
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
    }
  };

  const onSelect = ($event: React.SyntheticEvent, nodeId: string) => selectNode(nodeId);
  const onExpand = ($event: React.SyntheticEvent, nodeIds: string[]) => !flatten && setExpanded(nodeIds);
  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100%' }}>
      <ExplorerBreadCrumbs crumbs={crumbs} onClick={(_, i) => crumbSelect(i)} disabled={disabled} />
      <TreeView
        key={`tree-${disabled}`}
        aria-label="file system navigator"
        defaultCollapseIcon={<FolderOpenIcon />}
        defaultExpandIcon={<FolderIcon />}
        selected={selected}
        onNodeSelect={onSelect}
        expanded={expanded}
        onNodeToggle={onExpand}
        disableSelection={disabled}
        sx={{
          overflow: 'auto',
          height: 'calc(100% - 33px)',
        }}
      >
        {flatten && <ExplorerLoading loading={loading[selected]} empty={!tree[selected]?.length} />}
        {flatten &&
          !loading[selected] &&
          tree[selected]?.map((f, i) => (
            <ExplorerLeaf key={`${i}-${disabled}`} nodeId={`${selected}-${i}`} folder={f} tree={tree} loading={loading} disabled={disabled} />
          ))}
        {!flatten &&
          tree?.root?.map((f, i) => (
            <ExplorerLeaf key={`${i}-${disabled}`} nodeId={`root-${i}`} folder={f} tree={tree} loading={loading} disabled={disabled} />
          ))}
      </TreeView>
    </Container>
  );
};
