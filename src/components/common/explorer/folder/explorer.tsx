import ClearIcon from '@mui/icons-material/Clear';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { TreeView } from '@mui/lab';
import { Button, Container, Stack, TextField, Tooltip } from '@mui/material';

import React, { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';

import { catchError, finalize, tap } from 'rxjs';

import type { File, FileList, Folder, RootSlice } from '@src/models';

import { LoggerService, NotificationService, QueryService } from '@src/services';
import { getDestinationsHistory } from '@src/store/selectors';
import { useI18n } from '@src/utils';

import { ExplorerBreadCrumbs } from './explorer-breadcrumb';
import { ExplorerLeaf } from './explorer-leaf';
import { ExplorerLeafAdd } from './explorer-leaf-add';
import { ExplorerLoading } from './explorer-loading';
import { ExplorerRecent } from './explorer-recent';

import type { FC } from 'react';
import type { Observable } from 'rxjs';

export type ExplorerProps = {
  collapseOnSelect?: boolean;
  flatten?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  fileType?: 'dir' | 'all';
  startPath?: string;
  onChange?: (event: ExplorerEvent) => void;
  editable?: boolean;
  search?: boolean;
};

export type ExplorerEvent = {
  id?: string;
  path?: string;
  folder?: File | Folder;
};

type Tree = Record<string, (Folder | File)[]>;

// TODO implement virtual scroll
export const Explorer: FC<ExplorerProps> = ({ collapseOnSelect, flatten, disabled, readonly, fileType, startPath, onChange, editable, search }) => {
  const i18n = useI18n('common', 'explorer');

  const [showDestinations, setShowDestinations] = useState(false);
  const recentDestinations = useSelector<RootSlice, string[]>(getDestinationsHistory);

  const [tree, setTree] = useState<Tree>({});
  const [filteredTree, setFilteredTree] = useState<Tree>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({
    root: true,
  });
  const [selected, setSelected] = useState<string>('root');
  const [selectedPath, setSelectedPath] = useState<string | undefined>(startPath);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [crumbs, setCrumbs] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('');

  const showFilter = search || (!disabled && !!filter);
  const doFilter = (f: File | Folder) => disabled || !filter || f?.name?.trim()?.toLowerCase()?.includes(filter?.trim()?.toLowerCase());
  useEffect(() => {
    if (showFilter && tree) {
      const filtered = Object.entries(tree).reduce((curr, [key, value]) => {
        curr[key] = value?.filter(doFilter);
        return curr;
      }, {} as Tree);
      setFilteredTree(filtered);
    } else {
      setFilteredTree(tree);
    }
  }, [tree, search, disabled, filter]);

  useEffect(() => {
    if (QueryService.isLoggedIn) {
      QueryService.listFolders(readonly ?? true).subscribe({
        next: list => {
          setTree({ root: list?.shares ?? [] });
          setLoading(_loading => ({ ..._loading, root: false }));
        },
        error: error => {
          LoggerService.error(`Failed load folders.`, error);
          NotificationService.error({
            title: i18n(`list_folders_fail`, 'common', 'error'),
            message: error?.message ?? error?.name ?? '',
          });
        },
      });
    }
  }, []);

  const selectPath = (path: string) => {
    setCrumbs(path?.includes('/') ? path?.split('/') : [path]);
    setSelectedPath(path);
  };

  useEffect(() => {
    if (startPath?.length) selectPath(startPath);
  }, [startPath]);

  const listFiles = (path: string, key: string): Observable<FileList> => {
    setLoading({ ...loading, [key]: true });
    return QueryService.listFiles(path, fileType ?? 'dir').pipe(
      tap((list: FileList) => setTree({ ...tree, [key]: list?.files ?? [] })),
      finalize(() => {
        setTimeout(() => setLoading({ ...loading, [key]: false }), 200);
      }),
      catchError(error => {
        LoggerService.error(`Failed load files for path '${path}'.`, { path, key, error });
        NotificationService.error({
          title: i18n(`list_files_fail`, 'common', 'error'),
          message: error?.message ?? error?.name ?? '',
        });
        throw error;
      }),
    );
  };

  const onSelectChange = (id: string, path: string[], folder?: File | Folder) => {
    setSelected(id);
    setCrumbs(path);
    setSelectedPath(path.join('/'));
    onChange?.({ id, path: path.join('/'), folder });
  };

  const selectNode = (nodeId: string) => {
    setFilter('');
    if (selected !== nodeId) {
      const ids = nodeId.split('-');
      const index = Number(ids.pop());
      const folder = filteredTree[ids?.join('-')][index];
      const path = folder.path.split('/')?.slice(1);

      if (!flatten && collapseOnSelect) {
        setExpanded([...expanded.filter(id => nodeId.startsWith(id)), nodeId]);
      }

      if (!filteredTree[nodeId] && flatten) {
        onSelectChange(nodeId, path);
        listFiles(folder.path, nodeId).subscribe();
      } else if (!filteredTree[nodeId]) {
        listFiles(folder.path, nodeId).subscribe(() => onSelectChange(nodeId, path, folder));
      } else {
        onSelectChange(nodeId, path, folder);
      }
    }
  };

  const crumbSelect = (index?: number) => {
    if (index) {
      const ids = selected.split('-');
      if (index < (ids?.length ?? 0) - 1) {
        ids.pop();
        selectNode(ids.join('-'));
      }
    } else {
      setFilter('');
      setSelected('root');
      setExpanded([]);
      setCrumbs([]);
    }
  };

  const spliceTree = (nodeId: string, newFolder?: Folder | File, oldFolder?: Partial<Folder | File>) => {
    setTree(old => {
      const _new = { ...old };

      // if renamed, remove children nodes and splice new folder
      if (oldFolder?.name) {
        Object.keys(old)?.forEach(key => {
          if (key.startsWith(nodeId)) delete _new[key];
        });

        if (newFolder) {
          const nodePath = nodeId.split('-');
          const index = Number(nodePath?.pop());

          if (index && Number.isInteger(index)) {
            _new[nodePath.join('-')][index] = newFolder;
          }
        }
      }
      // else juste add new folder to active node
      else {
        _new[nodeId].push(newFolder as File & Folder);
      }
      return _new;
    });
  };

  const onSelect = ($event: React.SyntheticEvent, nodeId: string) => selectNode(nodeId);
  const onExpand = ($event: React.SyntheticEvent, nodeIds: string[]) => !flatten && setExpanded(nodeIds);

  const containerRef = useRef<HTMLDivElement>(null);

  const listener = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    if (e.key === 'Backspace') setFilter(_prev => _prev.slice(0, -1));
    else setFilter(_prev => `${_prev}${e.key}`);
  };

  useEffect(() => {
    if (disabled) {
      containerRef?.current?.removeEventListener('keydown', listener);
      setFilter('');
    } else containerRef?.current?.addEventListener('keydown', listener);
    return () => containerRef?.current?.removeEventListener('keydown', listener);
  }, [containerRef, disabled]);

  return (
    <Container ref={containerRef} disableGutters maxWidth={false} sx={{ height: '100%', outline: 'none' }} tabIndex={0}>
      <ExplorerBreadCrumbs
        crumbs={crumbs}
        showDestinations={showDestinations}
        hasDestinations={!!recentDestinations?.length}
        onClick={(_, i) => crumbSelect(i)}
        onRecent={() => setShowDestinations(_show => !_show)}
        disabled={disabled}
      />
      {showDestinations ? (
        <ExplorerRecent
          selected={selectedPath}
          destinations={recentDestinations}
          onSelect={destination => {
            selectPath(destination);
            onChange?.({ path: destination });
          }}
        />
      ) : (
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
            height: `calc(100% - ${showFilter ? 4.5 : 2.0625}em)`,
          }}
        >
          {
            // only > 1 so that we do not allow creation of shares
            flatten && editable && !loading[selected] && selected?.split('-')?.length > 1 && selectedPath && (
              <ExplorerLeafAdd nodeId={selected} path={selectedPath} disabled={disabled} spliceTree={spliceTree} />
            )
          }
          {flatten && <ExplorerLoading loading={loading[selected]} empty={!filteredTree[selected]?.length} />}
          {flatten &&
            !loading[selected] &&
            filteredTree[selected].map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`${selected}-${i}`}
                folder={f}
                tree={filteredTree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
          {!flatten &&
            filteredTree?.root?.map((f, i) => (
              <ExplorerLeaf
                key={`${i}-${disabled}`}
                nodeId={`root-${i}`}
                folder={f}
                tree={filteredTree}
                loading={loading}
                disabled={disabled}
                editable={editable}
                spliceTree={spliceTree}
              />
            ))}
        </TreeView>
      )}
      {showFilter && (
        <Stack direction="row" sx={{ flex: '1 1 auto', alignItems: 'center', p: '0 0.25em' }}>
          <TextField
            placeholder={'Search'}
            variant="standard"
            fullWidth={true}
            value={filter}
            disabled={disabled}
            onChange={e => setFilter(e.target.value)}
          />
          <Tooltip arrow title={i18n('cancel', 'common', 'buttons')} PopperProps={{ disablePortal: true }}>
            <span>
              <Button
                key="cancel"
                color="error"
                sx={{ display: 'flex', flex: '1 1 auto', minWidth: '0', p: '0.5em', fontSize: '0.75em' }}
                disabled={disabled || !filter}
                onClick={() => setFilter('')}
              >
                <ClearIcon fontSize="small" sx={{ width: '1em', fontSize: '1.125em' }} />
              </Button>
            </span>
          </Tooltip>
        </Stack>
      )}
    </Container>
  );
};
