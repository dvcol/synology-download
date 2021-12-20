import React, { useEffect } from 'react';
import { File, FileList, Folder } from '../../../models';
import { QueryService } from '../../../services';
import { finalize, Observable, tap } from 'rxjs';
import { TreeView } from '@mui/lab';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { ExplorerBreadCrumbs } from './explorer-breadcrumb';
import { ExplorerLeaf } from './explorer-leaf';

export const Explorer = ({ collapseOnSelect, flatten, disabled }: { collapseOnSelect?: boolean; flatten?: boolean; disabled?: boolean }) => {
  const [tree, setTree] = React.useState<Record<string, File[] | Folder[]>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [selected, setSelected] = React.useState<string>('root');
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [crumbs, setCrumbs] = React.useState<string[]>([]);

  useEffect(() => {
    QueryService.isReady && QueryService.listFolders().subscribe((list) => setTree({ root: list?.shares ?? [] }));
  }, []);

  const listFiles = (path: string, key: string): Observable<FileList> => {
    setLoading({ ...loading, [key]: true });
    return QueryService.listFiles(path, 'dir').pipe(
      tap((list: FileList) => setTree({ ...tree, [key]: list?.files ?? [] })),
      finalize(() => {
        setTimeout(() => setLoading({ ...loading, [key]: false }), 200);
      })
    );
  };

  const setCrumbsAndSelected = (nodeId: string, path: string[]) => {
    setSelected(nodeId);
    setCrumbs(path);
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
        setCrumbsAndSelected(nodeId, path);
        listFiles(folder.path, nodeId).subscribe();
      } else if (!tree[nodeId]) {
        listFiles(folder.path, nodeId).subscribe(() => setCrumbsAndSelected(nodeId, path));
      } else {
        setCrumbsAndSelected(nodeId, path);
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
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      <ExplorerBreadCrumbs crumbs={crumbs} onClick={(_, i) => crumbSelect(i)} disabled={disabled} />
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<FolderOpenIcon />}
        defaultExpandIcon={<FolderIcon />}
        selected={selected}
        onNodeSelect={onSelect}
        expanded={expanded}
        onNodeToggle={onExpand}
        disableSelection={disabled}
      >
        {flatten && loading[selected] && (
          <Typography sx={{ m: '0.25rem 0' }}>
            <Box component={'span'} sx={{ m: '0 0.3rem 0 0.7rem' }}>
              <CircularProgress size={'0.6rem'} />
            </Box>
            <span>Loading folder content</span>
          </Typography>
        )}
        {flatten &&
          !loading[selected] &&
          tree[selected]?.map((f, i) => (
            <ExplorerLeaf key={`${i}`} nodeId={`${selected}-${i}`} folder={f} tree={tree} loading={loading} disabled={disabled} />
          ))}
        {!flatten &&
          tree?.root?.map((f, i) => <ExplorerLeaf key={`${i}`} nodeId={`root-${i}`} folder={f} tree={tree} loading={loading} disabled={disabled} />)}
      </TreeView>
    </Container>
  );
};
