import React, { useEffect } from 'react';
import { QueryService } from '../../../services';
import { finalize, tap } from 'rxjs';
import { TreeItem, TreeView } from '@mui/lab';
import { File, FileList, Folder, FolderList } from '../../../models';
import { Box, Breadcrumbs, Button, CircularProgress, Container, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import InfoIcon from '@mui/icons-material/Info';

// TODO :  can't select readonly folder
export const TaskAdd = () => {
  const [tree, setTree] = React.useState<Record<string, Folder[] | File[]>>({});
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});
  const [selected, setSelected] = React.useState<string>('root');
  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [crumbs, setCrumbs] = React.useState<string[]>([]);

  useEffect(() => {
    QueryService.isReady &&
      QueryService.listFolders()
        .pipe(tap(console.log))
        .subscribe((list: FolderList) => list?.shares?.length && setTree({ root: list?.shares }));
  }, []);

  const listFiles = (path: string, key: string) => {
    const timeout = setTimeout(() => setLoading({ ...loading, [key]: true }), 200);
    QueryService.listFiles(path, 'dir')
      .pipe(
        tap(console.log),
        finalize(() => {
          clearTimeout(timeout);
          setLoading({ ...loading, [key]: false });
        })
      )
      .subscribe((list: FileList) => setTree({ ...tree, [key]: list?.files ?? [] }));
  };

  const onSelect = (nodeId: string) => {
    if (selected !== nodeId) {
      setSelected(nodeId);
      setExpanded([...expanded.filter((id) => nodeId.startsWith(id)), nodeId]);
      const ids = nodeId.split('-');
      const index = Number(ids.pop());
      const folder = tree[ids?.join('-')][index];
      setCrumbs(folder.path.split('/')?.slice(1));
      if (!tree[nodeId]) {
        listFiles(folder.path, nodeId);
      }
    }
  };

  const crumbSelect = (index?: number) => {
    if (index !== undefined) {
      const ids = selected.split('-');
      console.log(ids?.length, index);
      if (index < ids?.length - 1) {
        ids.pop();
        onSelect(ids.join('-'));
      }
    } else {
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
    }
  };

  const Leaf = ({ nodeId, folder }: { nodeId: string; folder: Folder | File }) => (
    <TreeItem nodeId={`${nodeId}`} label={folder.name}>
      {loading[nodeId] && (
        <Typography sx={{ m: '0.25rem 0' }}>
          <Box component={'span'} sx={{ m: '0 0.3rem 0 0.7rem' }}>
            <CircularProgress size={'0.6rem'} />
          </Box>
          <span>Loading folder content</span>
        </Typography>
      )}
      {tree[nodeId] && !tree[nodeId].length && !loading[nodeId] && (
        <Typography sx={{ display: 'flex', alignItems: 'center', pl: '0.5rem', m: '0.25rem 0' }}>
          <InfoIcon sx={{ width: '1rem', height: '1rem', mr: '0.25rem' }} />
          <span>This folder does not contain any sub-folders.</span>
        </Typography>
      )}
      {tree[nodeId]?.map((sf, i) => (
        <Leaf key={`${nodeId}-${i}`} nodeId={`${nodeId}-${i}`} folder={sf} />
      ))}
    </TreeItem>
  );
  return (
    <Container disableGutters maxWidth={false} sx={{ overflow: 'auto', height: 'calc(100vh - 48px)', padding: '0.25rem' }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Button
          variant="text"
          startIcon={<HomeIcon sx={{ width: '0.9rem', height: '0.9rem' }} />}
          sx={{ textTransform: 'capitalize' }}
          onClick={() => crumbSelect()}
        >
          Root
        </Button>
        {crumbs?.map((folder, i) => (
          <Button
            key={i}
            variant="text"
            startIcon={<FolderIcon sx={{ width: '0.9rem', height: '0.9rem' }} />}
            sx={{ textTransform: 'capitalize' }}
            onClick={() => crumbSelect(i + 1)}
          >
            {folder}
          </Button>
        ))}
      </Breadcrumbs>
      {/*// TODO : fetch default path ?*/}
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<FolderOpenIcon />}
        defaultExpandIcon={<FolderIcon />}
        selected={selected}
        onNodeSelect={($event: React.SyntheticEvent, nodeId: string) => onSelect(nodeId)}
        expanded={expanded}
        onNodeToggle={($event: React.SyntheticEvent, nodeIds: string[]) => setExpanded(nodeIds)}
      >
        {tree?.root?.map((f, i) => (
          <Leaf key={`${i}`} nodeId={`root-${i}`} folder={f} />
        ))}
      </TreeView>
    </Container>
  );
};
